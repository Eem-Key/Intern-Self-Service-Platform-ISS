export type WorkSetup = 'wfh' | 'onsite';

export type AttendanceRecord = {
    id: string;
    intern_id: string;
    clock_in: string | null;
    clock_out: string | null;
    work_date: string;
    hours_logged: number | null;
    work_setup: WorkSetup;
};

export type TimeInResponse = {
    message: string;
    data: AttendanceRecord;
};

export type TimeOutResponse = {
    message: string;
    data: AttendanceRecord;
};