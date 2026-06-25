import type { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { Prisma } from '../../../prisma/generated/client/client.js';

export const fetchRecordsPaginated = async (req: Request, res: Response) => {
    const authUser = (req as any).user;
    
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 5;
    const log_category = req.query.log_category as string | undefined;

    const skip = page * pageSize;

    try {
        const whereClause = {
            intern_id: authUser.id,
            ...(log_category && { log_category })
        };

        const [data, count] = await Promise.all([
            prisma.records_with_display_date.findMany({
                where: whereClause,
                orderBy: { display_date: 'desc' },
                skip: skip,
                take: pageSize
            }),
            prisma.records_with_display_date.count({
                where: whereClause
            })
        ]);

        res.json({ data, count });
    } catch (error) {
        console.error('Error fetching paginated records:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
};

export const fetchRecordById = async (
    req: Request, 
    res: Response, 
    table: 'attendance_logs' | 'eod_reports' | 'leave_requests' | 'profile_update_requests'
) => {
    const { record_id } = req.params;
    try {
        // @ts-ignore: Dynamic access to Prisma model
        const data = await prisma[table].findUnique({ where: { record_id } });
        if (!data) return res.status(404).json({ error: 'Record not found' });
        
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: `Failed to fetch ${table}` });
    }
};

export const fetchProfileUpdateRequestWithProfile = async (req: Request, res: Response) => {
    const raw_id = req.params.record_id;
    const record_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!record_id) {
        return res.status(400).json({ error: 'Record ID is required' });
    }

    try {
        const updateRequest = await prisma.profile_update_requests.findUnique({
            where: { 
                record_id: record_id
            },
            include: {
                records: {
                    include: {
                        interns: { include: { profiles: true } }
                    }
                }
            }
        });

        if (!updateRequest) return res.status(404).json({ error: 'Request not found' });

        const profile = updateRequest.records?.interns?.profiles;
        const internDetails = updateRequest.records?.interns;

        const mergedData = {
            record_id: updateRequest.record_id,
            update_type: updateRequest.update_type,
            reason: updateRequest.reason,
            requested_data: {
                ...(profile as object),
                ...(updateRequest.requested_data as object),
                intern_info: {
                    university: internDetails?.university,
                    year_level: internDetails?.year_level,
                    program: internDetails?.program,
                    required_hours: internDetails?.required_hours,
                    start_date: internDetails?.start_date,
                    ...(updateRequest.requested_data as any)?.intern_info || {}
                }
            }
        };

        res.json(mergedData);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch complex profile request' });
    }
};

export const fetchFullName = async (req: Request, res: Response) => {
    const raw_id = req.params.user_id;
    const user_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const profile = await prisma.profiles.findUnique({
            where: { id: user_id },
            select: { 
                first_name: true, 
                middle_name: true, 
                last_name: true, 
                suffix: true 
            }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const middleInitial = profile.middle_name 
            ? `${profile.middle_name.charAt(0).toUpperCase()}.` 
            : null;

        const fullname = [
            profile.first_name,
            middleInitial,
            profile.last_name,
            profile.suffix
        ]
        .filter(Boolean)
        .join(' ');

        res.json({ fullname });
    } catch (error) {
        console.error('Error fetching full name:', error);
        res.status(500).json({ error: 'Failed to fetch name' });
    }
};

export const updateProfileUpdateRequest = async (req: Request, res: Response) => {
    const partialUpdate = req.body;
    const raw_id = req.params.record_id;
    const record_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!record_id) {
        return res.status(400).json({ error: 'Record ID is required' });
    }

    try {
        const existing = await prisma.profile_update_requests.findUnique({
            where: { record_id },
        });

        if (!existing) return res.status(404).json({ error: 'Request not found' });

        const existingData = existing.requested_data as any;
        const incomingData = partialUpdate.requested_data || {};

        const newRequestedData = {
            ...existingData,
            ...incomingData,
            intern_info: {
                ...(existingData?.intern_info || {}),
                ...(incomingData?.intern_info || {})
            }
        };

        const updatedRequest = await prisma.profile_update_requests.update({
            where: { record_id },
            data: {
                requested_data: newRequestedData as Prisma.InputJsonValue,
                reason: partialUpdate.reason || existing.reason
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating profile request:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
};