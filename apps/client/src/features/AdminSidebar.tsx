import {
    CircleCheckBig,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Menu,
    User,
    X,
} from 'lucide-react';

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import profilepic from '../assets/images/default_pic.png';
import { logoutUserAPI } from '../api/auth.api.ts';

import { supabase } from '../config/supabase';
import { useQuery } from '@tanstack/react-query';

const navItems = [
    {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Interns',
        path: '/admin/interns',
        icon: User,
    },
    {
        label: 'Activity Records',
        path: '/admin/activity-records',
        icon: ClipboardList,
    },
    {
        label: 'Approvals',
        path: '/admin/approvals',
        icon: CircleCheckBig,
    },
];

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { data: adminProfile, isLoading: isAdminProfileLoading } = useQuery({
    queryKey: ['admin-sidebar-profile'],
    queryFn: async () => {
        const {
        data: { user },
        error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
        console.error('Error getting admin auth user:', authError);
        return null;
        }

        const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, middle_name, last_name, suffix, position, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

        if (error) {
        console.error('Error fetching admin profile:', error);
        return null;
        }

        return data;
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    });

    const fullName = adminProfile
    ? [
        adminProfile.first_name,
        adminProfile.middle_name
            ? `${adminProfile.middle_name.charAt(0).toUpperCase()}.`
            : null,
        adminProfile.last_name,
        adminProfile.suffix,
        ]
        .filter(Boolean)
        .join(' ')
    : 'Admin';

    const position = adminProfile?.position || 'Admin';

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
        await logoutUserAPI();
        await supabase.auth.signOut();

        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authUser');

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');

        navigate('/login', { replace: true });
        } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to log out. Please try again.');
        }
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMobileSidebarOpen(false);
    };

    const latestAvatarPath = adminProfile?.avatar_url || null;

    const { data: signedAvatarUrl, isLoading: isAvatarLoading } = useQuery({
    queryKey: ['admin-sidebar-avatar-url', latestAvatarPath],
    queryFn: async () => {
        if (!latestAvatarPath) return null;

        const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(latestAvatarPath, 3600);

        if (error) {
        console.error('Error creating admin avatar signed URL:', error);
        return null;
        }

        return data?.signedUrl || null;
    },
    enabled: !!latestAvatarPath,
    refetchInterval: 1000 * 60 * 50,
    });

    const hasAvatarPath = Boolean(latestAvatarPath);
    const userAvatar = signedAvatarUrl || (!hasAvatarPath ? profilepic : null);

    return (
        <>
        {/* Mobile / Tablet Top Bar */}
        <div className="fixed left-0 top-0 z-[9997] h-16 w-full bg-[#002D6F] shadow-md lg:hidden" />
        <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="fixed left-4 top-2.5 z-[9998] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white shadow-lg ring-1 ring-white/20 lg:hidden"
        >
            <Menu size={24} />
        </button>

      {/* Mobile / Tablet Overlay */}
        {isMobileSidebarOpen && (
            <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm lg:hidden"
            />
        )}
            <aside
                className={`fixed left-0 top-0 z-[9999] flex h-screen w-[270px] flex-col overflow-x-hidden bg-[#002D6F] px-6 py-8 text-white transition-transform duration-300 ease-in-out
                ${
                    isMobileSidebarOpen
                    ? 'translate-x-0'
                    : '-translate-x-full lg:translate-x-0'
                }
                lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[270px]`}
            >
        {/* Mobile Close Button */}
        <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute right-4 top-4 rounded-full p-1 transition hover:bg-white/10 lg:hidden"
            >
            <X size={22} />
        </button>

        <div className="flex flex-col items-center gap-0">
            {(isAdminProfileLoading || isAvatarLoading) && hasAvatarPath ? (
                <div className="h-16 w-16 animate-pulse rounded-full bg-white/20 sm:h-20 sm:w-20 lg:h-28 lg:w-28" />
                ) : userAvatar ? (
                <img
                    src={userAvatar}
                    alt={`${fullName} profile`}
                    className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20 lg:h-28 lg:w-28"
                />
                ) : (
                <div className="h-16 w-16 rounded-full bg-[#d9d9d9] sm:h-20 sm:w-20 lg:h-28 lg:w-28" />
            )}

            <div className="text-center">
            <h2 className="mt-2 text-lg font-bold sm:text-xl">{fullName}</h2>
            <p className="text-xs sm:text-sm">{position}</p>
            </div>
        </div>

        <nav className="mt-10 w-full space-y-2 overflow-x-hidden">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
                <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-full px-6 py-3 text-left text-white transition ${
                isActive ? 'bg-[#FFBF10]' : 'hover:bg-white/10'
                }`}
                >
                <Icon size={18} />
                <span className="text-sm sm:text-base">{item.label}</span>
                </button>
            );
            })}
        </nav>

        <div className="mt-auto border-t border-white/70 pt-7">
            <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 text-white"
            >
            <LogOut size={18} />
            <span className="text-sm sm:text-base">Log out</span>
            </button>
        </div>
        </aside>
        </>
    );
}

export default AdminSidebar;