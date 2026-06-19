import { useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';
import Banner from '../approvals/banner/ApprovalBanner';

function AdminApprovals() {

    useEffect(() => {
            document.title = 'Approvals | Intern Self Service';
            }, []);
    
            
    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 lg:ml-[270px] lg:px-6 lg:py-5">
        {/*<section className="flex min-h-screen w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">*/}
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col">
            <Banner />

            </div>
        </section>
        </main>
    );
}

export default AdminApprovals;