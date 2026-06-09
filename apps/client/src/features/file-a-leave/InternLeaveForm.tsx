import InternSidebar from '../../features/InternSidebar';
import LeaveFormCard from './components/LeaveFormCard';
import Banner from './banner/LeaveFormBanner';

function InternLeave() {
    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <InternSidebar />

        <section className="w-full px-4 py-6 sm:px-6 lg:ml-[270px] lg:px-8">
            <div className="mx-auto w-full max-w-[2560px]">
            <Banner />

            <div className="mt-8 flex justify-start">
                <LeaveFormCard />
            </div>
            </div>
        </section>
        </main>
    );
}

export default InternLeave;