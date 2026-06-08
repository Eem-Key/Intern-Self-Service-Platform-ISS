import { useEffect } from 'react';
import InternSidebar from '../../InternSidebar';
import AttendanceCard from './components/AttendanceCard';
import WelcomeBanner from './components/banner/WelcomeBanner';
import EODReportCard from './components/EODReportCard';
import NotificationCard from './components/NotificationCard';
import ProgramProgressCard from './components/ProgramProgressCard';

function InternDashboard() {

    useEffect(() => {
        document.title = 'Dashboard | Intern Self Service';
        }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <InternSidebar />

        <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">
            <WelcomeBanner />

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.95fr] xl:items-stretch">
            <div className="grid gap-5 xl:grid-rows-[1fr_1fr]">
                <AttendanceCard />
                <ProgramProgressCard />
            </div>

            <div className="grid gap-5 xl:grid-rows-[auto_1fr]">
                <NotificationCard />
                <EODReportCard />
            </div>
            </div>
        </section>
        </main>
    );
}

export default InternDashboard;