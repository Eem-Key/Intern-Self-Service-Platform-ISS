import type { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { insertAdminNotificationService } from '../../services/notification.service.js'

export const fetchActiveInternsCount = async (req: Request, res: Response) => {
    try {
        const count = await prisma.interns.count({ where: { status: 'active' } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active interns' });
    }
};

export const fetchActiveAttendanceCount = async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        if (!today) {
            throw new Error("Date generation failed");
        }

        const count = await prisma.attendance_logs.count({
            where: {
                work_date: new Date(today),
                clock_out: null
            }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance count' });
    }
};

export const fetchPendingRequestsCount = async (req: Request, res: Response) => {
    try {
        const count = await prisma.records.count({ where: { status: 'pending' } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
};

export const fetchAttendanceByRange = async (req: Request, res: Response) => {
    const { start_date, end_date } = req.query;

    try {
        const logs = await prisma.attendance_logs.findMany({
            where: {
                work_date: {
                    gte: new Date(start_date as string),
                    lte: new Date(end_date as string)
                }
            },
            include: {
                records: {
                    include: {
                        interns: { include: { profiles: true } }
                    }
                }
            }
        });

        const formatted = logs.map(item => ({
            record_id: item.record_id,
            clock_in: item.clock_in,
            clock_out: item.clock_out,
            work_date: item.work_date,
            hours_logged: item.hours_logged,
            work_setup: item.work_setup,
            Name: item.records?.interns?.profiles || null
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance range' });
    }
};

export const fetchAdminNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await prisma.notifications.findMany({
            where: { status: 'pending' },
            orderBy: { sent_at: 'desc' }
        });
        res.json({ message: 'Notifications fetched successfully', data: notifications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAdminNotificationAsRead = async (req: Request, res: Response) => {
    const rew_id = req.params.id;
    const notification_id = Array.isArray(rew_id) ? rew_id[0] : rew_id;

    if (!notification_id) {
        return res.status(400).json({ error: 'Notification ID is required' });
    }
    try {
        const result = await prisma.notifications.updateMany({
            where: { 
                id: notification_id, 
                is_read: { not: true }, 
                status: 'pending' 
            },
            data: { is_read: true }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Notification not found or already read.' });
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

function formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}