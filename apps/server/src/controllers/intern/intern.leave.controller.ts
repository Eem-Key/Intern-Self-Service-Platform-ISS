import type { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { insertInternNotificationService } from '../../services/notification.service.js'

export const fetchLeaveDates = async (req: Request, res: Response) => {
    const authUser = (req as any).user;
    try {
        const leave_dates = await prisma.leave_requests.findMany({
            where: {
                records: {
                    intern_id: authUser.id,
                    status: { in: ['pending', 'approved'] }
                }
            },
            select: { start_date: true, end_date: true }
        });
        
        res.json(leave_dates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave dates' });
    }
};

export const insertLeaveRequest = async (req: Request, res: Response) => {
    const { formData } = req.body;
    const authUser = (req as any).user;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const record = await tx.records.create({
                data: {
                    intern_id: authUser.id,
                    log_category: 'leave_request',
                    activity_description: formData.reason_category === 'sick_medical' ? 'Medical_Leave' : 'Academic_Leave',
                    status: 'pending'
                }
            });

            const leaveRequest = await tx.leave_requests.create({
                data: {
                    record_id: record.id,
                    reason_category: formData.reason_category,
                    description: formData.description,
                    start_date: new Date(formData.start_date),
                    end_date: new Date(formData.end_date)
                }
            });

            return { record, leaveRequest };
        });

        try {
            await insertInternNotificationService(result.record);
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
        }

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit leave request' });
    }
};

export const checkOverlap = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const authUser = (req as any).user;

    try {
        const count = await prisma.leave_requests.count({
            where: {
                records: {
                    intern_id: authUser.id,
                    status: { in: ['pending', 'approved'] }
                },
                start_date: { lte: new Date(endDate as string) },
                end_date: { gte: new Date(startDate as string) }
            }
        });
        res.json({ is_overlapping: count > 0 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check leave overlap' });
    }
};
