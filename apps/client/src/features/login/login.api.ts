// MOCK Login
import { supabase } from '../../config/supabase';
import type { LoginFormValues, LoginResponse } from '../../../../shared/types/login.types';

export async function loginUser(payload: LoginFormValues): Promise<LoginResponse> {
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
        .select('first_name, last_name, role, department, position, office, requires_password_change')
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
                department: profileData.department,
                position: profileData.position,
                office: profileData.office,
            },
            requiresPasswordChange: profileData.requires_password_change,
        },
    };
}

