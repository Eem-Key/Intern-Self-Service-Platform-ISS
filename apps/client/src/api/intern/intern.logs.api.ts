import { apiClient } from '../../services/apiClient';
import { supabase } from '../../config/supabase';
import type { 
    Record,
} from '../../../../shared/types/record.types';
import type { 
    ProfileUpdateRequestForm,
    ProfileUpdateRequest
} from '../../../../shared/types/profile.types';

export async function fetchRecordsPaginatedAPI(
    page: number, 
    pageSize: number = 5,
    log_category?: string
) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }
    
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(log_category && { log_category })
    });

    return await apiClient<{ 
        data: (Record & { display_date: string })[];
        count: number 
    }>(`/intern/logs/fetch?${params.toString()}`, {
        method: 'GET',
        token: token ?? undefined,
    });
}

async function fetchById(path: string, id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }

    return apiClient(`/intern/logs/${path}/${id}`, { method: 'GET', token: token ?? undefined });
}

export const fetchAttendanceByIdAPI = (id: string) => fetchById('attendance', id);
export const fetchEodReportByIdAPI = (id: string) => fetchById('eod-report', id);
export const fetchLeaveRequestByIdAPI = (id: string) => fetchById('leave', id);
export const fetchProfileUpdateRequestByIdAPI = (id: string) => fetchById('profile-update', id);

export async function fetchProfileUpdateRequestWithProfileByIdAPI(record_id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }
    
    return await apiClient<any>(`/intern/logs/profile-update-full/${record_id}`, { method: 'GET', token: token ?? undefined });
}

// export async function fetchFullNameAPI(user_id: string): Promise<string> {
//     const { data } = await supabase.auth.getSession();
//     const token = data.session?.access_token;

//     if (!token) {
//         throw new Error('You must be logged in to fetch a record.');
//     }

//     const response = await apiClient<{ full_name: string }>(`/intern/logs/name/${user_id}`, {
//         method: 'GET',
//         token: token ?? undefined
//     });

//     return response.full_name;
// }

export async function updateProfileUpdateRequestAPI(
    record_id: string,
    partialUpdate: Partial<ProfileUpdateRequestForm>
) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }

    return await apiClient<ProfileUpdateRequest>(`/intern/logs/profile-update-request/${record_id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: partialUpdate,
    });
}