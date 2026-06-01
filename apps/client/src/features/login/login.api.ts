// MOCK Login
import type { LoginFormValues, LoginResponse } from './login.types';

const USE_MOCK_LOGIN = true;

export async function loginUser(
    payload: LoginFormValues
): Promise<LoginResponse> {
    if (USE_MOCK_LOGIN) {
        await new Promise((resolve) => setTimeout(resolve, 700));

    
    if (
        payload.email !== 'intern@equicom.com' ||
        payload.password !== 'password123'
    ) {
        throw new Error('Incorrect email address or password.');
    }

    return {
        message: 'Login successful',
        data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            requiresPasswordChange: true,
            user: {
            id: '1',
            first_name: 'Intern',
            middle_name: null,
            last_name: 'User',
            suffix: null,
            role: 'intern',
            position: 'Intern',
            department: 'SDS',
            office: 'Makati Office',
            birth_date: null,
            gender: null,
            avatar_url: null,
            contact_number: null,
            address: null,
            email: payload.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            },
        },
        };
    }

    throw new Error('Backend login is not connected yet.');
}

