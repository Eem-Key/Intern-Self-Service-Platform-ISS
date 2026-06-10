import type { 
    LeaveReason, 
    ReportStatus 
} from './enums.types';

export type LeaveFormErrors = Partial<Record<keyof LeaveForm, string>>;

export type LeaveRequestInsert = Omit<LeaveRequest, 'id' | 'submitted_at' | 'admin_id' | 'reviewed_at' | 'admin_feedback'>;

export type LeaveForm = Omit<LeaveRequestInsert,  'intern_id' | 'status'>

export type LeaveRequestUpdate = Partial<LeaveRequestInsert>;

export type LeaveRequest = {
    id: string;
    intern_id: string;
    submitted_at: string;
    
    reason_category: LeaveReason | '';
    description: string;
    start_date: string;
    end_date: string;

    status: ReportStatus | 'pending';
    admin_id: string | null;
    reviewed_at: string | null;
    admin_feedback: string | null;
}

