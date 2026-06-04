export type EODReportStatus = 'DRAFT' | 'APPROVED' | 'PENDING' | 'SUBMITTED' | 'DECLINED';

export type EODReportPayload = {
    dateWritten: string;
    hoursSpent: string;
    projectName: string;
    taskAccomplished: string;
};

export type EODReport = {
    id: string;
    intern_id: string;
    date_written: string;
    created_at: string;
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