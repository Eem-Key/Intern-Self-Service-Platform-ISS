import InternSidebar from '../../InternSidebar';
import WelcomeBanner from './components/banner/WelcomeBanner';
import AttendanceCard from './components/AttendanceCard';
import ProgramProgressCard from './components/ProgramProgressCard';
import NotificationCard from './components/NotificationCard';
import EODReportCard from './components/EODReportCard';
import {useEffect, useState} from 'react';

function InternDashboard() {

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
                    document.title = 'Dashboard | Intern Self Service';
                    }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <InternSidebar onMobileSidebarChange={setIsMobileSidebarOpen} />
        <NotificationCard hidden={isMobileSidebarOpen} isFloatingOnly />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 xl:ml-[270px] xl:px-6 xl:py-5">
        {/*<section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 xl:px-8">*/}
            <div className="mx-auto flex w-full max-w-[2560px] flex-col gap-5">
            <WelcomeBanner />

            <div className="grid w-full grid-cols-1 gap-5 min-[1330px]:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] min-[1330px]:gap-5">
                <div className="grid min-w-0 grid-rows-[auto_auto] gap-5">
                    <AttendanceCard />
                    <ProgramProgressCard />
                </div>

                <div className="grid min-w-0 grid-rows-[auto_1fr] gap-5">
                    <NotificationCard isDesktopOnly />
                    <EODReportCard />
                </div>
                </div>
            </div>
        </section>
        </main>
    );
}

export default InternDashboard;