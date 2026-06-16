import type { RecordType, ReportStatus } from './enums.types';

export type Record = {
    id: string;
    intern_id: string;
    log_category: RecordType;
    created_at: string;
    date_created: string
    
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