import { apiClient } from '../../services/apiClient';
import { supabase } from '../../config/supabase';
import type { 
    ProfileIntern,
    ProfileUpdateRequestForm,
    ProfileUpdateRequest,
} from '../../../../shared/types/profile.types';
import type { 
    ChangePasswordValues,
} from '../../../../shared/types/login.types';

export async function fetchProfileAPI(): Promise<ProfileIntern> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }

    return await apiClient<ProfileIntern>('/intern/profile/fetch', {
        method: 'GET',
        token: token ?? undefined,
    });
}

export async function hasPendingProfileUpdateRequestAPI(update_type: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }

    const response = await apiClient<{ has_pending: boolean }>(`/intern/profile/pending/${update_type}`, {
        method: 'GET',
        token: token ?? undefined,
    });
    
    return response?.has_pending ?? false;
}

export async function insertProfileUpdateRequestAPI(updateRequest: ProfileUpdateRequestForm) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }

    return await apiClient<ProfileUpdateRequest>('/intern/profile/request', {
        method: 'POST',
        body: { updateRequest },
        token: token ?? undefined,
    });
}

export async function updatePasswordAPI(
    payload: ChangePasswordValues, 
    id: string
): Promise<{ error: string | null }> {
    try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            throw new Error('You must be logged in to fetch a record.');
        }
        
        await apiClient<{ message: string }>('/intern/profile/password', {
            method: 'PATCH',
            body: { payload },
            token: token ?? undefined,
        });

        return { error: null };
    } catch (err) {
        return { 
            error: err instanceof Error ? err.message : 'An unexpected error occurred.' 
        };
    }
}