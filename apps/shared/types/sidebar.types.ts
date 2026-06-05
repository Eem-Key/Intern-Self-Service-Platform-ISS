export type UserRole = 'intern' | 'admin' | string;

export type SidebarProfile = {
    id: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    position: string;
    avatar_url?: string | null;
};