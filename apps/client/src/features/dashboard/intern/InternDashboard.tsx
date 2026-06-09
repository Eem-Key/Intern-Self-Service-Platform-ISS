import InternSidebar from '../../InternSidebar';
import WelcomeBanner from './components/banner/WelcomeBanner';
import AttendanceCard from './components/AttendanceCard';
import ProgramProgressCard from './components/ProgramProgressCard';
import NotificationCard from './components/NotificationCard';
import EODReportCard from './components/EODReportCard';

function InternDashboard() {
    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <InternSidebar />

        <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 xl:px-8">
            <div className="mx-auto flex w-full max-w-[2560px] flex-col gap-5">
            <WelcomeBanner />

            <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
                <div className="flex min-w-0 flex-col gap-5">
                <AttendanceCard />
                <ProgramProgressCard />
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                <NotificationCard />
                <EODReportCard />
                </div>
            </div>
            </div>
        </section>
        </main>
    );
}

export default InternDashboard;