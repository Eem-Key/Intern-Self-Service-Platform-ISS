import { useQuery } from '@tanstack/react-query';
import { Clock3 } from 'lucide-react';

import { fetchActiveAttendanceAPI } from '../../../../api/adminDashboard.api';

function CurrentlyClockedInCard() {
    const {
        data: currentlyClockedIn = 0,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['admin-currently-clocked-in'],
        queryFn: fetchActiveAttendanceAPI,
    });

    return (
        <section className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
        <div>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#002D6F] text-white">
            <Clock3 size={24} />
            </span>

            <p className="text-sm font-medium text-gray-700">
            Currently Clocked In
            </p>
        </div>

        <p className="text-4xl font-bold text-black">
            {isLoading ? '...' : isError ? '--' : currentlyClockedIn}
        </p>
        </section>
    );
}

export default CurrentlyClockedInCard;