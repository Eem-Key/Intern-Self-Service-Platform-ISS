import type { Request, Response } from 'express';
import { prisma } from '../../db.js';
import type { 
    TableKey
} from '../../services/record.service.js'
import { 
    fetchRecordDetailsById 
} from '../../services/record.service.js'
import { insertAdminNotificationService } from '../../services/notification.service.js'


export const fetchPendingRequestsPerCategory = async (req: Request, res: Response) => {
    try {
        const groupedData = await prisma.records.groupBy({
            by: ['log_category'],
            where: {
                status: 'pending',
                log_category: {
                    not: 'attendance'
                }
            },
            _count: {
                log_category: true
            }
        });

        const counts = groupedData.reduce((acc, curr) => {
            if (curr.log_category) {
                acc[curr.log_category] = curr._count.log_category;
            }
            return acc;
        }, {} as Record<string, number>);

        res.json(counts);
    } catch (error) {
        console.error('Error fetching pending counts:', error);
        res.status(500).json({ error: 'Failed to fetch pending counts' });
    }
};

export const fetchPendingApprovalRecords = async (req: Request, res: Response) => {
    const { 
        page = '0', 
        pageSize = '10', 
        logCategory, 
        searchValue = '', 
        department = 'all' 
    } = req.query as Record<string, string>;

    const skip = parseInt(page) * parseInt(pageSize);
    const take = parseInt(pageSize);

    try {
        const whereClause: any = {
            status: 'pending',
            log_category: logCategory,
            interns: {
                profiles: {
                    department: department !== 'all' ? department : undefined,
                    OR: [
                        { full_name: { contains: searchValue, mode: 'insensitive' } }
                    ]
                }
            }
        };

        const [data, count] = await Promise.all([
            prisma.records.findMany({
                where: whereClause,
                include: {
                    interns: { include: { profiles: true } }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take
            }),
            prisma.records.count({ where: whereClause })
        ]);

        const processedData = await Promise.all(data.map(async (record) => {
            const profile = record.interns?.profiles;
            const name = [profile?.first_name, profile?.middle_name?.charAt(0) + '.', profile?.last_name]
                .filter(Boolean).join(' ').trim();

            const details = await fetchRecordDetailsById(record.id, record.log_category as TableKey);

            return {
                ...record,
                name: name || '--',
                position: profile?.position || record.interns?.intern_position || '--',
                department: profile?.department || '--',
                details: {
                    date_submitted: record.created_at,
                    time_submitted: record.created_at.toLocaleTimeString(),
                    ...details
                }
            };
        }));

        res.json({ data: processedData, count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
};

export const updateAdminReviewRecord = async (req: Request, res: Response) => {
    const { admin_feedback, status, update_type, profile_data, intern_data } = req.body;
    const admin_id = (req as any).user.id;

    const raw_id = req.params.record_id;
    const record_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!record_id) {
        return res.status(400).json({ error: 'Record ID is required' });
    }

    try {
        const result = await prisma.$queryRaw<typeof prisma.records[]>`
            SELECT * FROM update_admin_review(
                ${record_id}::uuid,
                ${admin_id}::uuid,
                ${admin_feedback ?? ''}, 
                ${status.toLowerCase()}::report_status,
                ${update_type ?? null},
                ${profile_data ? JSON.stringify(profile_data) : null}::jsonb,
                ${intern_data ? JSON.stringify(intern_data) : null}::jsonb
            )
        `;

        await insertAdminNotificationService(result[0]);

        res.json({ message: 'Record updated successfully', data: result });
    } catch (error) {
        console.error('Transaction Error:', error);
        res.status(500).json({ error: 'Failed to update record review' });
    }
};