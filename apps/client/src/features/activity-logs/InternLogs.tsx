import { useEffect } from 'react';
import InternSidebar from '../InternSidebar';
import Banner from './banner/LogsBanner';
import Timeline from './components/Timeline'

function InternLogs() {
    useEffect(() => {
        document.title = 'Activity Logs | Intern Self Service';
    }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex justify-start">
        <InternSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 lg:ml-[270px] lg:px-6 lg:py-5">
        {/*<section className="w-full px-4 py-5 sm:px-6 lg:ml-[270px] lg:px-8">*/}
            <div className="mx-auto flex w-full max-w-[2560px] flex-col gap-5">
            <Banner />
            <Timeline />
            </div>
        </section>
        </main>
    );
}

export default InternLogs;

