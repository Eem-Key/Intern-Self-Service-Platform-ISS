import { useEffect } from 'react';
import AdminSidebar from './components/AdminSidebar';

function AdminApprovals() {

    useEffect(() => {
            document.title = 'Approvals | Intern Self Service';
            }, []);
    
            
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <AdminSidebar />
        <h1 className="text-2xl font-bold text-black">Approvals</h1>
        </main>
    );
}

export default AdminApprovals;