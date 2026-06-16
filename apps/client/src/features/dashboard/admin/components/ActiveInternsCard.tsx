import { useQuery } from '@tanstack/react-query';
import { UsersRound } from 'lucide-react';

import { fetchActiveInternsAPI } from '../../../../api/adminDashboard.api';

function ActiveInternsCard() {
    const {
        data: activeInterns = 0,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['admin-active-interns'],
        queryFn: fetchActiveInternsAPI,
    });

    return (
        <section className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
        <div>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0058DD] text-white">
            <UsersRound size={24} />
            </span>

            <p className="text-sm font-medium text-gray-700">Active Interns</p>
        </div>

        <p className="text-4xl font-bold text-black">
            {isLoading ? '...' : isError ? '--' : activeInterns}
        </p>
        </section>
    );
}

export default ActiveInternsCard;