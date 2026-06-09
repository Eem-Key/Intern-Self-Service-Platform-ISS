import InternSidebar from '../../features/InternSidebar';
import LeaveFormCard from './components/LeaveFormCard';

function InternLeave() {
    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <InternSidebar />

        <section className="w-full px-4 py-6 sm:px-6 lg:ml-[270px] lg:px-8">
            <div className="mx-auto w-full max-w-[1180px]">
            <div className="rounded-xl bg-[#002D6F] px-6 py-8 text-white shadow-md sm:px-8">
                <h1 className="text-4xl font-bold">File a Leave</h1>
                <p className="mt-2 text-sm sm:text-base">
                Submit your leave request and wait for admin review and approval.
                </p>
            </div>

            <div className="mt-8 flex justify-start">
                <LeaveFormCard />
            </div>
            </div>
        </section>
        </main>
    );
}

export default InternLeave;