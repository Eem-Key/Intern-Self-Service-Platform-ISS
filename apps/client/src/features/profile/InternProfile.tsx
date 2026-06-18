import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchProfileAPI } from '../../api/profile.api';
import InternSidebar from '../InternSidebar';
import Banner from './banner/ProfileBanner';

import ProfileChangePasswordCard from './components/ChangePassword';
import ProfileDetailsCard from './components/ProfileDetailsCard';
import ProfilePictureCard from './components/ProfilePictureCard';
import { supabase } from '../../config/supabase';

function InternProfile() {

    const queryClient = useQueryClient();
    useEffect(() => {
                document.title = 'Profile | Intern Self Service';
                }, []);

    const {
        data: profile,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['intern-profile'],
        queryFn: fetchProfileAPI,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
        .channel(`intern-profile-updates-${profile.id}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'records',
                filter: `intern_id=eq.${profile.id}`,
            },
            () => {
                queryClient.invalidateQueries({
                    queryKey: ['pending-profile-update-request', 'avatar_update', profile.id],
                });

                queryClient.invalidateQueries({
                    queryKey: ['pending-profile-update-request', 'information_update', profile.id],
                });

                queryClient.invalidateQueries({ queryKey: ['records'] });
                queryClient.invalidateQueries({ queryKey: ['intern-profile'] });
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${profile.id}`,
            },
            () => {
                queryClient.invalidateQueries({ queryKey: ['intern-profile'] });
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'interns',
                filter: `id=eq.${profile.id}`,
            },
            () => {
                queryClient.invalidateQueries({ queryKey: ['intern-profile'] });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}, [profile?.id, queryClient]);

    if (isLoading) {
        return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
            <InternSidebar />

            <section className="flex min-h-screen w-full items-center justify-center px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">
                <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-xl">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />

                    <p className="text-sm font-semibold text-[#002D6F]">
                    Loading profile...
                    </p>
                </div>
            </section>
        </main>
        );
    }

    if (error || !profile) {
        return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
            <InternSidebar />

            <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">
            <p className="text-red-600">Unable to load profile.</p>
            </section>
        </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <InternSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 lg:ml-[270px] lg:px-6 lg:py-5">
        {/*<section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">*/}
            <div className="mx-auto max-w-[2560px]">
            <Banner />

            <div className="mt-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[1fr_0.62fr]">
                <ProfileDetailsCard profile={profile} />

                <div className="flex h-full flex-col gap-5">
                <ProfilePictureCard profile={profile} />
                <ProfileChangePasswordCard profile={profile} />
                </div>
            </div>
            </div>
        </section>
        </main>
    );
}

export default InternProfile;