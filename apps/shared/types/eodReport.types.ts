export type EODReportStatus = 'draft' | 'approved' | 'submitted' | 'denied';

export type EODReportPayload = {
    dateWritten: string;
    hoursSpent: number;
    projectName: string;
    taskAccomplished: string;
};

export type EODReport = {
    intern_id: string;
    date_written: string;
    project_name: string;
    task_accomplished: string;
    hours_spent: number;
    status: EODReportStatus;
};

export type EODReportWithAdminNotes = {
    intern_id: string;
    date_written: string;
    project_name: string;
    task_accomplished: string;
    hours_spent: string;
    status: EODReportStatus;
    admin_id: string | null;
    reviewed_at: string | null;
    admin_notes: string | null;
};

export type EODReportResponse = {
    message: string;
    data: EODReport;
};