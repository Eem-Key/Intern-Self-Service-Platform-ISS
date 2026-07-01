import { apiClient } from '../../services/apiClient';
import { supabase } from '../../config/supabase';
import type { 
    LeaveRequestForm,
} from '../../../../shared/types/leave.types';

export async function fetchAllLeaveRequestDatesOfInternAPI() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }
    return await apiClient<{ start_date: string; end_date: string }[]>('/intern/leave/dates', {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function insertLeaveRequestAPI(formData: LeaveRequestForm) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }
    return await apiClient('/intern/leave/request', {
        method: 'POST',
        body: { formData },
        token: token ?? undefined,
    });
}

export async function checkLeaveRequestDatesAPI(startDate: string, endDate: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }
    const response = await apiClient<{ is_overlapping: boolean }>(
        `/intern/leave/check-overlap?startDate=${startDate}&endDate=${endDate}`, { 
            method: 'GET',
            token: token ?? undefined,
        }
    );
    return response.is_overlapping;
}