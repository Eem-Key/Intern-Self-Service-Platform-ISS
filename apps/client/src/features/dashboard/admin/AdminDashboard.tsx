import AdminSidebar from './components/AdminSidebar';
import { useEffect } from 'react';

function AdminDashboard() {

    useEffect(() => {
        document.title = 'Dashboard | Intern Self Service';
        }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.95fr] xl:items-stretch">
            <div className="grid gap-5 xl:grid-rows-[1fr_1fr]">
                
            </div>

            <div className="grid gap-5 xl:grid-rows-[auto_1fr]">
            </div>
            </div>
        </section>
        </main>
    );
}

export default AdminDashboard;