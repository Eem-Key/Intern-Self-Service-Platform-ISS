import { useEffect } from 'react';
import InternSidebar from './components/InternSidebar';

function InternLogs() {

    useEffect(() => {
            document.title = 'Logs | Intern Self Service';
            }, []);
    
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <InternSidebar />
        <h1 className="text-2xl font-bold text-black">Intern Logs</h1>
        </main>
    );
}

export default InternLogs;