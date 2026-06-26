import type { Request, Response } from 'express';
import { prisma } from '../../db.js';
import type { 
    TableKey
} from '../../services/record.service.js'
import { 
    fetchRecordDetailsById 
} from '../../services/record.service.js'

export const fetchReviewedApprovalRecords = async (req: Request, res: Response) => {
    const cleanParam = (value: any) => (value === 'null' || value === 'undefined' || !value) ? undefined : value;

    const params = {
        page: parseInt(req.query.page as string) || 0,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        department: cleanParam(req.query.department),
        log_category: cleanParam(req.query.log_category),
        status: cleanParam(req.query.status),
        start_date: cleanParam(req.query.start_date),
        end_date: cleanParam(req.query.end_date)
    };
    
    const skip =params.page * params.pageSize;
    const take = params.pageSize;

    try {
        const whereClause: any = {
            status: params.status 
                ? { equals: params.status } 
                : { in: ['approved', 'denied'] },
                
            log_category: params.log_category || undefined,
            
            interns: params.department ? {
                profiles: { department: params.department }
            } : undefined,
            
            created_at: {
                gte: params.start_date ? new Date(params.start_date) : undefined,
                lt: params.end_date ? new Date(new Date(params.end_date).setDate(new Date(params.end_date).getDate() + 1)) : undefined
            }
        };

        const [data, count] = await Promise.all([
            prisma.records.findMany({
                where: whereClause,
                include: { interns: { include: { profiles: true } } },
                orderBy: { created_at: 'desc' },
                skip,
                take
            }),
            prisma.records.count({ where: whereClause })
        ]);

        const mappedRecords = await Promise.all(data.map(async (record: any) => {
            const profile = record.interns?.profiles;
            const name = [profile?.first_name, profile?.middle_name?.charAt(0).toUpperCase() + '.', profile?.last_name, profile?.suffix]
                .filter(Boolean).join(' ').trim();

            const details = await fetchRecordDetailsById(record.id, record.log_category as TableKey);

            return {
                ...record,
                name: name || '--',
                position: profile?.position || record.interns?.intern_position || '--',
                department: profile?.department || '--',
                avatar_url: profile?.avatar_url,
                details: { 
                    date_submitted: record.created_at, 
                    time_submitted: record.created_at.toLocaleTimeString(), 
                    ...(details || {}) 
                }
            };
        }));

        res.json({ data: mappedRecords, count });
    } catch (error) {
        console.log(error)
        console.error('Error fetching reviewed records:', error);
        res.status(500).json({ error: 'Failed to fetch reviewed records' });
    }
};