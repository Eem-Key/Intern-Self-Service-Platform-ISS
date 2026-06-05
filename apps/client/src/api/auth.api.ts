import { supabase } from '../config/supabase';
import type { LoginFormValues, LoginResponse } from '../../../shared/types/login.types';
import type { ChangePasswordFormValues } from '../../../shared/schemas/changePassword.schema';

export async function updatePasswordAPI(
    payload: ChangePasswordFormValues, 
    id: string
): Promise<{ error: string | null }> {
    try {
        const { error: authError } = await supabase.auth.updateUser({
            password: payload.newPassword
        });

        if (authError) {
            return { error: authError.message };
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ requires_password_change: false })
            .eq('id', id);

        if (profileError) {
            return { error: `Password updated, but failed to update status: ${profileError.message}` };
        }

        return { error: null };
    } catch (err) {
        return { error: 'An unexpected error occurred while updating your password.' };
    }
}

export async function loginUserAPI(payload: LoginFormValues): Promise<LoginResponse> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
    });
    
    if (authError) {
        throw new Error(authError.message);
    }

    const user = authData.user;
    if (!user) {
        throw new Error('Authentication failed. User session empty.');
    }

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, position, avatar_url, requires_password_change')
        .eq('id', user.id)
        .single();

    if (profileError) {
        throw new Error(`Profile synchronization failed: ${profileError.message}`);
    }

    return {
        message: 'Login successful',
        data: {
            accessToken: authData.session?.access_token || '',
            refreshToken: authData.session?.refresh_token || '',
            user: {
                id: user.id,
                email: user.email || '',
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                role: profileData.role,
                position: profileData.position,
                avatar_url: profileData.avatar_url || '',
            },
            requiresPasswordChange: profileData.requires_password_change,
        },
    };
}

export async function logoutUserAPI(): Promise<{ error: string | null }> {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { error: error.message };
        }

        return { error: null };
    } catch (err) {
        return { error: 'An unexpected error occurred during logout.' };
    }
}