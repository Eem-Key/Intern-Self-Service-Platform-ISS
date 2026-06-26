import { apiClient } from '../services/apiClient';
import { supabase } from '../config/supabase';
import type { 
    LoginFormValues,
    LoginResponse,
} from '../../../shared/types/login.types';

export async function loginUserAPI(payload: LoginFormValues): Promise<LoginResponse> {
    return await apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: payload,
    });
}

export async function logoutUserAPI(): Promise<{ error: string | null }> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to fetch a record.');
    }
    
    try {
        await apiClient('/auth/logout', {
            method: 'POST',
            token: token ?? undefined,
        });
        return { error: null };
    } catch (err) {
        return { error: 'An unexpected error occurred during logout.' };
    }
}

export async function setupFirstPasswordAPI(
    new_password: string,
    confirm_new_password: string,
): Promise<{ error: string | null }> {
    try {
        await apiClient('/auth/setup-password', {
            method: 'PATCH',
            body: { new_password, confirm_new_password },
        });
        return { error: null };
    } catch (err: any) {
        return { error: err.message || 'Failed to set password.' };
    }
}