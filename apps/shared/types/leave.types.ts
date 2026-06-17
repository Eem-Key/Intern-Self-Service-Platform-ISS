import type { LeaveReason } from './enums.types';

export type LeaveRequest = {
    record_id: string;
    reason_category: LeaveReason;
    description: string;
    start_date: string;
    end_date: string;
}

export type LeaveRequestUpdate = Partial<LeaveRequest>;

export type LeaveRequestFormErrors = Partial<Record<keyof LeaveRequest, string>>;

export type LeaveRequestForm = {
    reason_category: LeaveReason | '';
} & Omit<LeaveRequest, 'record_id' | 'reason_category'>;