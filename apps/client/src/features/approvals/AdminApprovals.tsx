import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '../AdminSidebar';
import Banner from '../approvals/banner/ApprovalBanner';
import { usefetchPendingRequestsPerRecord } from '../../api/adminApprovals.api';
import { updateAdminReviewRecord } from '../../api/record.api';
import type { ProfileUpdate } from '../../../../shared/types/profile.types'
import type { InternInfo } from '../../../../shared/types/intern.types'

function AdminApprovals() {
    const queryClient = useQueryClient();
    const { data: counts = {}, isLoading, error } = usefetchPendingRequestsPerRecord();
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        document.title = 'Approvals | Intern Self Service';
    }, []);

    const handleApprove = async () => {
        setIsUpdating(true);
        // const profileData: ProfileUpdate = {
        //     email: "intern2@equicom.com",
        //     gender: "male",
        //     office: "makati",
        //     suffix: "",
        //     address: "456 Address St. World",
        //     position: "Back-end Developer",
        //     last_name: "Yanga",
        //     birth_date: "2004-11-30",
        //     department: "SDS",
        //     first_name: "Ian",
        //     middle_name: "Caguimbay",
        //     contact_number: "01234567892",
        // };

        const profileData: ProfileUpdate = {
            avatar_url: "2f961278-7887-4fea-a718-166b7da9ab69/avatar-1781859276623.webp",
        };

        // const internData: InternInfo = {
        //     program: "BS Computer Science major in Software Technology",
        //     start_date: "2026-06-05",
        //     university: "De La Salle University",
        //     year_level: 4,
        //     required_hours: 500
        // };
        try {
            await updateAdminReviewRecord(
                '9e0029e2-6ff9-4271-91f6-d4f55165510d', 
                'approved!', 
                'approved',
                'avatar_update',
                profileData,
                // internData
            );
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            alert('Update successful!');
        } catch (error) {
            console.error('Failed to update:', error);
            alert('Error updating record');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    
    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 lg:ml-[270px] lg:px-6 lg:py-5">
        {/*<section className="flex min-h-screen w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">*/}
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col">
            <Banner />
                {/* For fetch pending counts */}
                <div className="mt-5 p-4 bg-white border border-gray-300 rounded">
                    <h3 className="font-bold mb-2">Pending Request Counts:</h3>
                    <pre>{JSON.stringify(counts, null, 2)}</pre>
                </div>
                {/* For testing approve or deny */}
                <button 
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="mt-5 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {isUpdating ? 'Updating...' : 'Approve Record'}
                </button>
            </div>
        </section>
        </main>
    );
}

export default AdminApprovals;