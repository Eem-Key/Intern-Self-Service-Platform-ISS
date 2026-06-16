import type { LogType, ReportStatus } from './enums.types';

export type ActivityLogStatus = ReportStatus;

export type ActivityLog = {

    id: string;

    source_id: string;

    type: LogType;
    activity: string;
    status: ActivityLogStatus;
    submitted_at: string;

    details?: {

        date?: string;
        time_in?: string | null;
        time_out?: string | null;
        hours_spent?: number | string | null;

        project_name?: string | null;
        task_accomplished?: string | null;


        leave_start_date?: string;
        leave_end_date?: string;
        leave_reason?: string;
        description?: string | null;

        update_type?: string;
        requested_data?: Record<string, unknown>;

        admin_feedback?: string | null;
    };
};