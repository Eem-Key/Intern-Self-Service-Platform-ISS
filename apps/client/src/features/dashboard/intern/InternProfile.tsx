import { useEffect } from 'react';
import InternSidebar from './components/InternSidebar';
import Banner from './components/banner/ProfileBanner';

function InternProfile() {

    useEffect(() => {
            document.title = 'Profile | Intern Self Service';
            }, []);
    
    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <InternSidebar />

        <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">
            <Banner />

        </section>
        </main>
    );
}

export default InternProfile;
