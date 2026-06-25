import type { Request, Response } from 'express';
import { prisma } from '../../db.js';

export const fetchAttendanceByDate = async (req: Request, res: Response) => {
    const raw_date = req.params.date;
    const date = Array.isArray(raw_date) ? raw_date[0] : raw_date;
    if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    try {
        const attendance = await prisma.attendance_logs.findFirst({
            where: {
                records: {
                    intern_id: (req as any).user.id,
                    log_category: 'attendance',
                    date_created: new Date(date), 
                },
            },
        });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

export const timeIn = async (req: Request, res: Response) => {
    const intern_id = (req as any).user.id;
    const { setup } = req.body;

    try {
        const existingLog = await prisma.attendance_logs.findFirst({
            where: {
                records: { intern_id: intern_id },
                clock_out: null
            }
        });

        if (existingLog) {
            return res.status(400).json({ error: 'You have an active session.' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const record = await tx.records.create({
                data: {
                    intern_id: intern_id,
                    log_category: 'attendance',
                    activity_description: 'Time_In',
                }
            });

            return await tx.attendance_logs.create({
                data: {
                    record_id: record.id,
                    work_setup: setup,
                }
            });
        });

        res.json({ message: 'Time in successful', data: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to time in' });
    }
};

export const timeOut = async (req: Request, res: Response) => {
    const now = new Date();

    const rew_id = req.params.attendance_id;
    const attendance_id = Array.isArray(rew_id) ? rew_id[0] : rew_id;

    if (!attendance_id) {
        return res.status(400).json({ error: 'Attendance ID is required' });
    }

    try {
        const log = await prisma.attendance_logs.findUnique({
            where: { record_id: attendance_id }
        });

        if (!log || log.clock_out !== null) {
            return res.status(400).json({ error: 'Log not found or already clocked out.' });
        }

        const clockInDate = new Date(log.clock_in!);
        const totalDiffInMs = now.getTime() - clockInDate.getTime();
        
        const lunchStart = new Date(clockInDate);
        lunchStart.setHours(12, 0, 0, 0);
        const lunchEnd = new Date(clockInDate);
        lunchEnd.setHours(13, 0, 0, 0);

        let lunchDurationInMs = 0;
        if (now > lunchStart) {
            if (clockInDate < lunchStart && now > lunchEnd) lunchDurationInMs = 3600000;
            else if (clockInDate >= lunchStart && clockInDate < lunchEnd && now > lunchEnd) lunchDurationInMs = lunchEnd.getTime() - clockInDate.getTime();
            else if (clockInDate < lunchStart && now >= lunchStart && now < lunchEnd) lunchDurationInMs = now.getTime() - lunchStart.getTime();
        }

        const hours_logged = Math.floor((totalDiffInMs - lunchDurationInMs) / (1000 * 60 * 60));

        const updated = await prisma.$transaction(async (tx) => {
            await tx.records.update({
                where: { id: attendance_id },
                data: { activity_description: 'Time_Out' }
            });

            return await tx.attendance_logs.update({
                where: { record_id: attendance_id },
                data: {
                    clock_out: now.toISOString(),
                    hours_logged: hours_logged
                }
            });
        });

        res.json({ message: 'Time out successful', data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to time out' });
    }
};

export const fetchProgramProgress = async (req: Request, res: Response) => {
    const rew_id = req.params.intern_id;
    const intern_id = Array.isArray(rew_id) ? rew_id[0] : rew_id;
    const authUser = (req as any).user;

    if (!intern_id) {
        return res.status(400).json({ error: 'Intern ID is required' });
    }

    try {
        const summary = await prisma.intern_hours_summary.findUnique({
            where: { intern_id: intern_id }
        });

        if (!summary) {
            return res.status(404).json({ error: 'Progress data not found' });
        }

        const profile = await prisma.profiles.findUnique({ where: { id: authUser.id } });
        const isAdmin = profile?.role === 'admin';
        const isOwner = summary.intern_id === authUser.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        }

        const data = {
            required_hours: summary.required_hours,
            rendered_hours: summary.rendered_hours,
            hours_left: Math.max(0, (summary.required_hours || 0) - (summary.rendered_hours || 0)),
            wfh_hours: summary.total_online_hours,
            onsite_hours: summary.total_onsite_hours,
        };

        res.json({ message: 'Program progress fetched successfully', data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch program progress' });
    }
};

export const fetchEODReportByDate = async (req: Request, res: Response) => {
    const authUser = (req as any).user;

    const raw_date = req.params.date;
    const date = Array.isArray(raw_date) ? raw_date[0] : raw_date;
    if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
    }

    try {
        const reportData = await prisma.eod_reports.findFirst({
            where: {
                date_written: new Date(date),
                records: {
                    intern_id: authUser.id,
                    log_category: 'eod_report'
                }
            },
            include: {
                records: {
                    select: { status: true }
                }
            }
        });

        if (!reportData) {
            return res.status(404).json({ error: 'Report not found for this date' });
        }

        const { records, ...report } = reportData;

        res.json({
            report: report,
            status: records?.status
        });
    } catch (error) {
        console.log(error)
        console.error('Error fetching EOD report:', error);
        res.status(500).json({ error: 'Failed to fetch EOD report' });
    }
};

export const insertEODReport = async (req: Request, res: Response) => {
    const { payload, reportStatus } = req.body;
    const intern_id = (req as any).user.id;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const record = await tx.records.create({
                data: {
                    intern_id,
                    log_category: 'eod_report',
                    activity_description: reportStatus === 'draft' ? 'Submission_of_Draft' : 'Submission_of_EOD_Report',
                    status: reportStatus
                }
            });

            const report = await tx.eod_reports.create({
                data: {
                    record_id: record.id,
                    date_written: new Date(payload.date_written),
                    project_name: payload.project_name,
                    task_accomplished: payload.task_accomplished,
                    hours_spent: payload.hours_spent,
                }
            });

            return report;
        });

        res.status(201).json({ message: `EOD ${reportStatus} saved successfully`, data: result });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to save EOD report' });
    }
};

export const updateEODReport = async (req: Request, res: Response) => {
    const { payload, reportStatus } = req.body;

    const rew_id = req.params.report_id;
    const report_id = Array.isArray(rew_id) ? rew_id[0] : rew_id;

    if (!report_id) {
        return res.status(400).json({ error: 'Attendance ID is required' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const report = await tx.eod_reports.update({
                where: { record_id: report_id },
                data: {
                    hours_spent: payload.hours_spent,
                    project_name: payload.project_name,
                    task_accomplished: payload.task_accomplished,
                }
            });

            await tx.records.update({
                where: { id: report_id },
                data: {
                    activity_description: reportStatus === 'draft' ? 'Submission_of_Draft' : 'Submission_of_EOD_Report',
                    status: reportStatus
                }
            });

            return report;
        });

        res.json({ message: `EOD ${reportStatus} updated successfully`, data: result });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to update EOD report' });
    }
};

export const fetchNotifications = async (req: Request, res: Response) => {
    const authUser = (req as any).user;

    try {
        const notifications = await prisma.notifications.findMany({
            where: {
                intern_id: authUser.id,
                status: {
                    in: ['approved', 'denied']
                }
            },
            orderBy: {
                sent_at: 'desc'
            }
        });

        res.json({
            message: 'Notifications fetched successfully',
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const insertNotification = async (req: Request, res: Response) => {
    const { record } = req.body;

    try {
        const profile = await prisma.profiles.findUnique({
            where: { id: record.intern_id },
            select: { first_name: true, last_name: true }
        });

        const fullName = profile 
            ? `${profile.first_name} ${profile.last_name}`.trim() 
            : 'Intern';

        const recordStr = record.log_category?.toString().toUpperCase().replace(/_/g, ' ');
        const conjunction = record.log_category === 'eod_report' ? 'an' : 'a';
        const readableDate = formatDate(new Date(record.created_at));

        const title = `${recordStr || 'REPORT or REQUEST'} is pending for review`;
        const message = `${fullName} submitted ${conjunction} ${recordStr || 'Report or Request'} on ${readableDate}.`;

        const newNotification = await prisma.notifications.create({
            data: {
                record_id: record.id,
                intern_id: record.intern_id,
                title,
                message,
                status: record.status
            }
        });

        res.status(201).json({ message: 'Notification created', data: newNotification });
    } catch (error) {
        console.error('Insert notification error:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
    const authUser = (req as any).user;
    const rew_id = req.params.id;
    const notification_id = Array.isArray(rew_id) ? rew_id[0] : rew_id;

    if (!notification_id) {
        return res.status(400).json({ error: 'Notification ID is required' });
    }

    try {
        const result = await prisma.notifications.updateMany({
            where: {
                id: notification_id,
                intern_id: authUser.id, 
                is_read: { not: true }, 
                status: { in: ['approved', 'denied'] }
            },
            data: {
                is_read: true
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Notification not found or already read.' });
        }

        res.json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error updating notification:', error);
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