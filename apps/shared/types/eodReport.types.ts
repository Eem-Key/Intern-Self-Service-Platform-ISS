export type EODReport = {
    record_id: string,
    date_written: string;
    project_name: string;
    task_accomplished: string;
    hours_spent: number;
    updated_at: string;
};

export type EODReportFormErrors = Partial<Record<keyof EODReportInsert, string>>;

export type EODReportForm = Omit<EODReport, 'record_id' | 'updated_at'>

export type EODReportInsert = Omit<EODReport, 'updated_at'>

export type EODReportUpdate = Omit<EODReport, 'record_id' |'date_written' | 'updated_at'>

export type EODReportResponse = {
    message: string;
    data: EODReport;
};