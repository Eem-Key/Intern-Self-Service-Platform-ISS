import { apiClient } from '../services/apiClient';
import { supabase } from '../config/supabase';
import type { 
    WorkSetup,
    ReportStatus
} from '../../../shared/types/enums.types';
import type {
    AttendanceRecord,
    TimeInResponse,
    TimeOutResponse
} from '../../../shared/types/attendance.types';
import type {
    ProgramProgressResponse
} from '../../../shared/types/intern.types';
import type {
    Record
} from '../../../shared/types/record.types';
import type {
    EODReport,
    EODReportForm
} from '../../../shared/types/eodReport.types';
import type {
    NotificationsResponse
} from '../../../shared/types/notification.types';

export async function fetchAttendanceByIdAPI(record_id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }

    return await apiClient<AttendanceRecord>(`/attendance/${record_id}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function fetchAttendanceByDateAPI(
    date: string
): Promise<AttendanceRecord | null> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }

    return await apiClient<AttendanceRecord | null>(`/intern/dashboard/date/${date}`, {
        method: 'GET',
        token: token,
    });
}

export async function timeInAPI(setup: WorkSetup) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<TimeInResponse>('/intern/dashboard/time-in', {
        method: 'POST',
        body: { setup },
        token: token ?? undefined,
    });
}

export async function timeOutAPI(attendance_id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<TimeOutResponse>(`/intern/dashboard/time-out/${attendance_id}`, {
        method: 'PATCH',
        token: token ?? undefined,
    });
}

export async function fetchProgramProgressAPI(inter_id: string): Promise<ProgramProgressResponse> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<ProgramProgressResponse>(`/intern/dashboard/progress/${inter_id}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function fetchEODReportByDateAPI(
    date: string
):Promise<{
    report: EODReport;
    status: ReportStatus | null;
}>  {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient(`/intern/dashboard/eod-report/${date}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function insertEODReportAPI(payload: EODReportForm, report_status: ReportStatus) {
    const { data } = await supabase.auth.getSession();
    
    return await apiClient('/intern/dashboard/eod-report', {
        method: 'POST',
        body: { payload, report_status },
        token: data.session?.access_token,
    });
}

export async function updateEODReportAPI(report_id: string, payload: EODReportForm, report_status: ReportStatus) {
    const { data } = await supabase.auth.getSession();
    
    return await apiClient(`/intern/dashboard/eod-report/${report_id}`, {
        method: 'PATCH',
        body: { payload, report_status },
        token: data.session?.access_token,
    });
}

export async function fetchInternNotificationsAPI(): Promise<NotificationsResponse> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<NotificationsResponse>('/intern/dashboard/notifications', {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function insertInternNotificationAPI(record: Record) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient('/intern/dashboard/notifications', {
        method: 'POST',
        body: { record },
        token: token ?? undefined,
    });
}

export async function updateInternNotificationsAsReadAPI(id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient(`/intern/dashboard/notifications/${id}/read`, {
        method: 'PATCH',
        token: token ?? undefined,
    });
}