import type { LeaveReason } from './enums.types';


export type LeaveFormPayload = {
    reason_category: LeaveReason | '';
    description: string;
    start_date: string;
    end_date: string;
};

