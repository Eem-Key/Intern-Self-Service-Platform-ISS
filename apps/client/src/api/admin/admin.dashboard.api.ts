import { apiClient } from '../../services/apiClient';
import { supabase } from '../../config/supabase';
import type { 
    Record,
} from '../../../../shared/types/record.types';
import type { 
    NotificationsResponse,
} from '../../../../shared/types/notification.types';

export async function fetchActiveInternsAPI(): Promise<number>  {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }

    const response = await apiClient<{ count: number }>(`/admin/dashboard/active-interns`, { method: 'GET', token: token ?? undefined });

    return response.count
}

export async function fetchActiveAttendanceAPI(): Promise<number>  {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }

    const response = await apiClient<{ count: number }>(`/admin/dashboard/active-attendance`, { method: 'GET', token: token ?? undefined });

    return response.count
}

export async function fetchPendingRequests(): Promise<number>  {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }

    const response = await apiClient<{ count: number }>(`/admin/dashboard/pending-requests`, { method: 'GET', token: token ?? undefined });

    return response.count
}

export async function fetchAttendancePerDateRange(start: string, end: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch active interns.');
    }

    return apiClient<any[]>(`/admin/dashboard/attendance?start_date=${start}&end_date=${end}`, { method: 'GET', token: token ?? undefined });
}

export async function fetchAdminNotificationsAPI(): Promise<NotificationsResponse> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient<NotificationsResponse>('/admin/dashboard/notifications', {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function insertAdminNotificationAPI(record: Record) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient('/admin/dashboard/notifications', {
        method: 'POST',
        body: { record },
        token: token ?? undefined,
    });
}

export async function updateAdminNotificationsAsReadAPI(id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return await apiClient(`/admin/dashboard/notifications/${id}/read`, {
        method: 'PATCH',
        token: token ?? undefined,
    });
}