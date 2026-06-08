export type LoginFormValues = {
    email: string;
    password: string;
};

export type UserRole = 'intern' | 'admin' | string;

export type UserProfile = {
    id: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    position: string;
    avatar_url?: string | null;
    email: string;
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