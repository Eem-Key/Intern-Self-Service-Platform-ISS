import type {
    ProfileUpdateType,
    RecordType,
    ReportStatus,
    LeaveReason,
} from './enums.types';

import type { Record } from './record.types';

export type ApprovalTab = Exclude<RecordType, 'attendance'>;

export type ApprovalInternInfo = {
    name: string;
    position: string | null;
    department: string | null;
    intern_role?: string | null;
};

export type ApprovalDetails = {
    date_submitted?: string | null;
    time_submitted?: string | null;

    // EOD
    hours_spent?: number | string | null;
    project_name?: string | null;
    task_accomplished?: string | null;
    intern_role?: string | null;

    // Leave
    reason_category?: LeaveReason | null;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;

    // Profile update
    update_type?: ProfileUpdateType | null;
    requested_data?: globalThis.Record<string, unknown>;

    // Avatar update
    old_avatar_url?: string | null;
    avatar_url?: string | null;
};

export type ApprovalRecord = 
Record &
    ApprovalInternInfo & 
    {
        log_category: ApprovalTab;
        status: ReportStatus;
        activity_description: string;
        details?: ApprovalDetails;
    };