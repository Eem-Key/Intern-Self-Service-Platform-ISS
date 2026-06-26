import type { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { supabaseAdmin } from '../../config/supabaseAdmin.js';

export const fetchAllInternList = async (req: Request, res: Response) => {
    const cleanParam = (val: any) => (val === 'null' || !val) ? undefined : val;

    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search_value = cleanParam(req.query.search_value);
    const department = cleanParam(req.query.department);
    const position = cleanParam(req.query.position);
    const status = cleanParam(req.query.status);

    try {
        const whereClause: any = {
            department,
            intern_position: position,
            status,
        };

        if (search_value) {
            whereClause.OR = [
                { program: { contains: search_value, mode: 'insensitive' } },
                { university: { contains: search_value, mode: 'insensitive' } },
                { full_name: { contains: search_value, mode: 'insensitive' } }
            ];
        }

        const [data, count] = await prisma.$transaction([
            prisma.intern_list_view.findMany({
                where: whereClause,
                skip: page * pageSize,
                take: pageSize,
                orderBy: { profile_created_at: 'desc' }
            }),
            prisma.intern_list_view.count({ where: whereClause })
        ]);

        const mappedInterns = data.map((item: any) => {
            const middleInitial = item.middle_name ? `${item.middle_name.charAt(0).toUpperCase()}.` : null;
            const fullName = [item.first_name, middleInitial, item.last_name, item.suffix]
                .filter(Boolean)
                .join(' ');

            return {
                id: item.id,
                university: item.university,
                program: item.program,
                status: item.status,
                intern_position: item.intern_position,
                department: item.department,
                name: fullName || item.full_name,
                avatar_url: item.avatar_url,
            };
        });

        res.json({ data: mappedInterns, count });
    } catch (error) {
        console.error('Error fetching intern list:', error);
        res.status(500).json({ error: 'Failed to fetch intern list' });
    }
};

export const fetchProfileById = async (req: Request, res: Response) => {
    const raw_id = req.params.user_id;
    const user_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const profile = await prisma.profiles.findUnique({
            where: { id: user_id },
            include: {
                interns: true
            }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const { interns, ...rest } = profile;

        res.json({
            ...rest,
            intern_info: interns
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const fetchProgramProgressHours = async (req: Request, res: Response) => {
    const authUser = (req as any).user;

    const raw_id = req.params.user_id;
    const user_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }


    try {
        const isAdmin = authUser.role === 'admin';
        const isOwner = authUser.id === user_id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        }

        const summary = await prisma.intern_hours_summary.findUnique({
            where: { intern_id: user_id }
        });

        if (!summary) {
            return res.json({
                required_hours: 0,
                rendered_hours: 0,
                remaining_hours: 0
            });
        }

        const result = {
            required_hours: summary.required_hours || 0,
            rendered_hours: summary.rendered_hours || 0,
            remaining_hours: Math.max(0, (summary.required_hours || 0) - (summary.rendered_hours || 0)),
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching progress hours:', error);
        res.status(500).json({ error: 'Failed to fetch progress hours' });
    }
};

export const fetchAllAttendanceById = async (req: Request, res: Response) => {
    const raw_id = req.params.user_id;
    const user_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const attendanceLogs = await prisma.attendance_logs.findMany({
            where: {
                records: {
                    intern_id: user_id
                }
            },
            orderBy: {
                work_date: 'desc'
            }
        });

        const formattedData = attendanceLogs.map((item: any) => ({
            record_id: item.record_id,
            clock_in: item.clock_in,
            clock_out: item.clock_out,
            work_date: item.work_date,
            hours_logged: item.hours_logged,
            work_setup: item.work_setup,
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching attendance logs:', error);
        res.status(500).json({ error: 'Failed to fetch attendance logs' });
    }
};

export const fetchAllEodReportById = async (req: Request, res: Response) => {
    const raw_id = req.params.user_id;
    const user_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const eodReports = await prisma.eod_reports.findMany({
            where: {
                records: {
                    intern_id: user_id
                }
            },
            include: {
                records: {
                    select: {
                        status: true,
                        admin_id: true,
                        admin_feedback: true,
                        reviewed_at: true
                    }
                }
            },
            orderBy: {
                date_written: 'desc'
            }
        });

        const formattedData = eodReports.map((item: any) => ({
            record_id: item.record_id,
            date_written: item.date_written,
            project_name: item.project_name,
            task_accomplished: item.task_accomplished,
            hours_spent: item.hours_spent,
            status: item.records.status,
            admin_id: item.records.admin_id,
            admin_feedback: item.records.admin_feedback,
            reviewed_at: item.records.reviewed_at
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching EOD reports:', error);
        res.status(500).json({ error: 'Failed to fetch EOD reports' });
    }
};

export const deactivateIntern = async (req: Request, res: Response) => {
    console.log("Request Body:", req.body); 
    console.log("Request Params:", req.params);
    const { deactivate_reason } = req.body;

    const raw_id = req.params.intern_id;
    const intern_id = Array.isArray(raw_id) ? raw_id[0] : raw_id;

    if (!intern_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (!intern_id || !deactivate_reason) {
        return res.status(400).json({ error: 'Intern ID and reason are required' });
    }

    try {
        await prisma.interns.update({
            where: { id: intern_id },
            data: { 
                status: 'deactivated', 
                deactivate_reason: deactivate_reason 
            }
        });

        const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(intern_id, {
            ban_duration: '876000h'
        });

        if (adminError) {
            console.error("Auth ban failed:", adminError);
            return res.status(500).json({ error: "Intern database updated, but auth ban failed." });
        }

        res.json({ message: 'Intern deactivated successfully' });
    } catch (error) {
        console.log('ERROR', error)
        console.error('Error deactivating intern:', error);
        res.status(500).json({ error: 'Failed to deactivate intern' });
    }
};