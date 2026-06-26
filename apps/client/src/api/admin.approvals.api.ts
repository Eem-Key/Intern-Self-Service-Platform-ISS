import { apiClient } from '../services/apiClient';
import { supabase } from '../config/supabase';

export async function fetchPendingRequestsPerRecordAPI() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }

    return await apiClient<Record<string, number>>('/admin/approvals/pending-by-category', { method: 'GET', token: token ?? undefined });
}

interface FetchParams {
    page: number;
    pageSize: number;
    logCategory: string;
    searchValue: string;
    department: string;
}

export async function fetchPendingApprovalRecordsAPI(params: FetchParams) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }

    const queryString = new URLSearchParams(params as any).toString();
    
    return await apiClient<{ data: any[], count: number }>(
        `/admin/approvals/pending-approvals?${queryString}`, 
        { method: 'GET', token: token ?? undefined }
    );
}

export async function updateAdminReviewRecordAPI(
    record_id: string,
    payload: {
        admin_feedback: string;
        status: string;
        update_type?: string;
        profile_data?: any;
        intern_data?: any;
    }
) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }

    return await apiClient(`/admin/approvals/records/${record_id}/review`, {
        method: 'PATCH',
        body: payload,
        token: token ?? undefined
    });
}