import type { WorkSetupType } from './enums.types';

export type AttendanceRecord = {
    id: string;
    intern_id: string;
    clock_in: string | null;
    clock_out: string | null;
    work_date: string;
    hours_logged: number | null;
    work_setup: WorkSetupType;
};

export type TimeInResponse = {
    message: string;
    data: AttendanceRecord;
};

export type TimeOutResponse = {
    message: string;
    data: AttendanceRecord;
};

export type AttendanceWithName = AttendanceRecord & {
    Name: {
        first_name: string;
        middle_name: string | null;
        last_name: string;
        suffix: string | null;
    } | null;
};