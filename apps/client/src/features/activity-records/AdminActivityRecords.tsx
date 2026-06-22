import { useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';

function AdminActivityRecords() {

    useEffect(() => {
            document.title = 'Activity Records | Intern Self Service';
            }, []);
    
            
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <AdminSidebar />
        <h1 className="text-2xl font-bold text-black">Activity Records</h1>
        </main>
    );
}

export default AdminActivityRecords;