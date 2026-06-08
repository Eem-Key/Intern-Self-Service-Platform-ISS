import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchProfileAPI } from '../../api/profile.api';
import InternSidebar from '../InternSidebar';
import Banner from './banner/ProfileBanner';

import ProfileChangePasswordCard from './components/ChangePassword';
import ProfileDetailsCard from './components/ProfileDetailsCard';
import ProfilePictureCard from './components/ProfilePictureCard';

function InternProfile() {

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
    });

    if (isLoading) {
        return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
            <InternSidebar />

            <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">
            <p className="text-gray-500">Loading profile...</p>
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

        <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">
            <div className="mx-auto max-w-[1120px]">
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