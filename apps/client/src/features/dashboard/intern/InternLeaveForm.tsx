import { useEffect } from 'react';
import InternSidebar from './components/InternSidebar';

function InternLeave() {

    useEffect(() => {
            document.title = 'File a Leave | Intern Self Service';
            }, []);
    
            
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <InternSidebar />
        <h1 className="text-2xl font-bold text-black">File a Leave</h1>
        </main>
    );
}

export default InternLeave;