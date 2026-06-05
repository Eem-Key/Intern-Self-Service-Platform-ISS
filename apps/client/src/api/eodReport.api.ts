// MOCK FOR TESTING

import type {
    EODReport,
    EODReportPayload,
    EODReportResponse,
} from '../../../shared/types/eodReport.types';

const MOCK_EOD_REPORTS_KEY = 'mockEODReports';

const FORCE_SAVE_ERROR = false;
const FORCE_SUBMIT_ERROR = false;

function getStoredReports(): EODReport[] {
    const savedReports = localStorage.getItem(MOCK_EOD_REPORTS_KEY);

    if (!savedReports) {
        return [];
    }

    return JSON.parse(savedReports) as EODReport[];
}

function saveStoredReports(reports: EODReport[]) {
    localStorage.setItem(MOCK_EOD_REPORTS_KEY, JSON.stringify(reports));
}

function createMockReport(
    payload: EODReportPayload,
    status: 'draft' | 'submitted'
): EODReport {
    return {
        id: crypto.randomUUID(),
        intern_id: 'mock-intern-id',
        date_written: payload.dateWritten,
        created_at: new Date().toISOString(),
        project_name: payload.projectName,
        task_accomplished: payload.taskAccomplished,
        hours_spent: payload.hoursSpent,
        status,
        admin_id: null,
        reviewed_at: null,
        admin_notes: null,
    };
}

export async function saveEODDraftAPI(
    payload: EODReportPayload
): Promise<EODReportResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (FORCE_SAVE_ERROR) {
        throw new Error('Save failed. Please try again.');
    }

    const reports = getStoredReports();
    const newReport = createMockReport(payload, 'draft');

    saveStoredReports([newReport, ...reports]);

    return {
        message: 'EOD draft saved successfully',
        data: newReport,
    };
}

export async function submitEODReportAPI(
    payload: EODReportPayload
): Promise<EODReportResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (FORCE_SUBMIT_ERROR) {
        throw new Error('Submission failed. Please try again.');
    }

    const reports = getStoredReports();
    const newReport = createMockReport(payload, 'submitted');

    saveStoredReports([newReport, ...reports]);

    return {
        message: 'EOD report submitted successfully',
        data: newReport,
    };
}