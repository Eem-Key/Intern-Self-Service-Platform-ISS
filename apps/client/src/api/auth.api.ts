import { supabase } from '../config/supabase';
import { getAuthUserId } from '../utils/auth.util';
import type { 
    LoginFormValues, 
    LoginResponse, 
    ChangePasswordValues 
} from '../../../shared/types/login.types';
import type { UserProfile } from '../../../shared/types/profile.types';
import { fetchUserProfileAPI } from './profile.api'
import { isAccountActive } from '../utils/auth.util';

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

    const userProfile: UserProfile = await fetchUserProfileAPI(user.id)

    if (!await isAccountActive(userProfile.id, userProfile.role)) {
        await supabase.auth.signOut();
        throw new Error('Your internship account is no longer active.');
    }

    return {
        message: 'Login successful',
        data: {
            accessToken: authData.session?.access_token || '',
            refreshToken: authData.session?.refresh_token || '',
            user: userProfile,
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

export async function updatePasswordAPI(
    payload: ChangePasswordValues, 
    id: string
): Promise<{ error: string | null }> {
    try {
        if (payload.new_password === payload.current_password) {
            return { error: "New password cannot be the same as the current password." };
        }

        if (payload.new_password !== payload.confirm_new_password) {
            return { error: "New password does not match." };
        }

        const { error: authError } = await supabase.auth.updateUser({
            password: payload.new_password,
            current_password: payload.current_password
        });

        if (authError) {
            return { error: `Failed to update password: ${authError.message}` };
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

export async function setupFirstPasswordAPI(
    new_password: string,
    confirm_new_password: string,
): Promise<{ error: string | null }> {
    const user_id = await getAuthUserId();

    if (!user_id) {
        throw new Error('You must be authorized to set up a new password.');
    }

    if (new_password !== confirm_new_password) {
        return { error: "Passwords do not match." };
    }

    const { error: authError } = await supabase.auth.updateUser({
        password: new_password
    });

    if (authError) {
        return { error: `Failed to set password: ${authError.message}` };
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ requires_password_change: false })
        .eq('id', user_id);

    if (profileError) {
        return { error: `Password set, but failed to update status: ${profileError.message}` };
    }

    return { error: null };
}