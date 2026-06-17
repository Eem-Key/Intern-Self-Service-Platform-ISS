import type { 
    RecordType, 
    ReportStatus,
    ActivityDescription
} from './enums.types';

    export type Record = {
        id: string;
        intern_id: string;
        log_category: RecordType;
        created_at: string;
        date_created: string;
        activity_description: ActivityDescription;
        
        status: ReportStatus | null;
        admin_id: string | null;
        reviewed_at: string | null;
        admin_feedback: string | null;
    };

    export type RecordInsert  = Omit<
        Record, 
        'id' | 
        'created_at' |
        'date_created' |
        'admin_id' |
        'reviewed_at' |
        'admin_feedback'
    >;

    export type RecordLog = Record & {
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
            requested_data?: globalThis.Record<string, unknown>;
        };
    };
