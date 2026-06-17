import { useEffect } from 'react';

import AdminSidebar from '../../AdminSidebar.tsx';
import Banner from './banner/DashboardBanner.tsx';

import ActiveInternsCard from './components/ActiveInternsCard';
import CurrentlyClockedInCard from './components/CurrentlyClockedInCard';
import PendingApprovalsCard from './components/PendingApprovalsCard';
import AttendanceTracker from './components/AttendanceTracker';
import NotificationCard from './components/NotificationCard';

function AdminDashboard() {
  const pendingApprovals = 0; // replace with API 

    useEffect(() => {
        document.title = 'Dashboard | Intern Self Service';
    }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="flex min-h-screen w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col">
            <Banner />

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <ActiveInternsCard />
                <CurrentlyClockedInCard />
                <PendingApprovalsCard value={pendingApprovals} />
            </div>

            {/*add flex-1*/}
            <div className="mt-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[1fr_0.48fr]">
            <AttendanceTracker />
            <NotificationCard />
            </div>
            </div>
        </section>
        </main>
    );
}

export default AdminDashboard;