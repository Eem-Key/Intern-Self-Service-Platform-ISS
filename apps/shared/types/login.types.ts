import type { UserProfile } from './profile.types';

export type LoginFormValues = {
    email: string;
    password: string;
};

export type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;

export type LoginResponse = {
    message: string;
    data: {
        accessToken: string;
        refreshToken?: string;
        user: UserProfile;
    };
};

export type ChangePasswordValues = {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
}

export type ChangePasswordErrors = Partial<Record<keyof ChangePasswordValues, string>>;