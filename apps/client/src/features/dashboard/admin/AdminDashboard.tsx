import { useEffect, useState } from 'react';

import AdminSidebar from '../../AdminSidebar';
import ActiveInternsCard from './components/ActiveInternsCard';
import CurrentlyClockedInCard from './components/CurrentlyClockedInCard';
import PendingApprovalsCard from './components/PendingApprovalsCard';
import AttendanceTracker from './components/AttendanceTracker';
import NotificationCard from './components/NotificationCard';
import Banner from './banner/DashboardBanner';

function AdminDashboard() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        document.title = 'Dashboard | Intern Self Service';
    }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar onMobileSidebarChange={setIsMobileSidebarOpen} />

        <NotificationCard hidden={isMobileSidebarOpen} isFloatingOnly />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 lg:ml-[270px] lg:px-6 lg:py-5">
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col">
            <Banner />

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <ActiveInternsCard />
                <CurrentlyClockedInCard />
                <PendingApprovalsCard />
            </div>

            <div className="mt-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[1fr_0.48fr]">
                <AttendanceTracker />
                <NotificationCard isDesktopOnly />
            </div>
            </div>
        </section>
        </main>
    );
}

export default AdminDashboard;