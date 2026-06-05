import { useEffect } from 'react';
import AdminSidebar from './components/AdminSidebar';

function AdminInternList() {

    useEffect(() => {
            document.title = 'Intern List | Intern Self Service';
            }, []);
    
            
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <AdminSidebar />
        <h1 className="text-2xl font-bold text-black">Intern List</h1>
        </main>
    );
}

export default AdminInternList;