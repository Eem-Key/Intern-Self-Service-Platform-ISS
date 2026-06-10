import type { ReportStatus } from './enums.types';

export type EODReportFormErrors = Partial<Record<keyof EODReportForm, string>>;

export type EODReportPayload = {
    dateWritten: string;
    hoursSpent: number;
    projectName: string;
    taskAccomplished: string;
};

export type EODReportInsert = Omit<
    EODReport, 
    'id' |
    'created_at' |
    'admin_id' |
    'reviewed_at' |
    'admin_notes'
>


export type EODReportUpdate = Omit<
    EODReport, 
    'id' |
    'intern_id' |
    'date_written' |
    'created_at' |
    'admin_id' |
    'reviewed_at' |
    'admin_notes'
>

export type EODReportForm = Omit<EODReportInsert, 'intern_id' | 'status'>

export type EODReport = {
    id: string,
    intern_id: string;
    date_written: string;
    created_at: string;
    project_name: string;
    task_accomplished: string;
    hours_spent: number;
    status: ReportStatus;
    admin_id: string | null;
    reviewed_at: string | null;
    admin_notes: string | null;
};

export type EODReportWithAdminNotes = {
    intern_id: string;
    date_written: string;
    project_name: string;
    task_accomplished: string;
    hours_spent: string;
    status: ReportStatus;
    admin_id: string | null;
    reviewed_at: string | null;
    admin_notes: string | null;
};

export type EODReportResponse = {
    message: string;
    data: EODReport;
};