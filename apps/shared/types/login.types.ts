export type LoginFormValues = {
    email: string;
    password: string;
};

export type UserRole = 'intern' | 'admin' | string;

export type UserProfile = {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix?: string | null;
    role: UserRole;
    position?: string | null;
    department?: string | null;
    office?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    avatar_url?: string | null;
    contact_number?: string | null;
    address?: string | null;
    email: string;
    created_at?: string;
    updated_at?: string;
};

export type LoginResponse = {
    message: string;
    data: {
        accessToken: string;
        refreshToken?: string;
        user: UserProfile;
        requiresPasswordChange: boolean;
    };
};