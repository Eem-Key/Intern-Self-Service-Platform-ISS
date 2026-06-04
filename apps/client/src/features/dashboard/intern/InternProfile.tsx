import { useEffect } from 'react';
import InternSidebar from './components/InternSidebar';

function InternProfile() {

    useEffect(() => {
            document.title = 'Profile | Intern Self Service';
            }, []);
    
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <InternSidebar />
        <h1 className="text-2xl font-bold text-black">Intern Profile</h1>
        </main>
    );
}

export default InternProfile;