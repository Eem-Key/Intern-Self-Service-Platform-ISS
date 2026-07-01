import { apiClient } from '../../services/apiClient';
import { supabase } from '../../config/supabase';

export async function fetchAllInternListInformationAPI(params: any) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const queryString = new URLSearchParams(params).toString();
    return await apiClient<{ data: any[], count: number }>(
        `/admin/interns/fetchall?${queryString}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function fetchProfileByIdAPI(user_id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<any>(`/admin/interns/profile/${user_id}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function fetchProgramProgressHoursAPI(user_id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<any>(`/admin/interns/progress/${user_id}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function fetchAllAttendanceByIdAPI(user_id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<any[]>(`/admin/interns/attendance/${user_id}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function fetchAllEodReportByIdAPI(user_id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<any[]>(`/admin/interns/eod-reports/${user_id}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function deactivateInternAPI(intern_id: string, deactivate_reason: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;


    return await apiClient<any>(`/admin/interns/deactivate/${intern_id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {deactivate_reason},
    });
}