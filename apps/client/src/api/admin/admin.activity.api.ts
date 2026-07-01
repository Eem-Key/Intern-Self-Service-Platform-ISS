import { apiClient } from '../../services/apiClient';
import { supabase } from '../../config/supabase';

export async function fetchReviewedApprovalRecordsAPI(params: any) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }
    const queryString = new URLSearchParams(params).toString();
    return await apiClient<{ data: any[], count: number }>(
        `/admin/activity/reviewed-approvals?${queryString}`, 
        { method: 'GET', token: token ?? undefined }
    );
}