import { useQuery } from '@tanstack/react-query';
import { Clock3 } from 'lucide-react';

import { fetchActiveAttendanceAPI } from '../../../../api/admin.dashboard.api';

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
        <section className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-white px-2 py-3 shadow-md sm:px-6 sm:py-4">
        <div>
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#002D6F] text-white sm:mb-4 sm:h-12 sm:w-12">
                <Clock3 size={18} className="sm:h-6 sm:w-6" />
            </span>

            <p className="text-[10px] font-medium leading-tight text-gray-700 sm:text-sm">
                Currently Clocked In
            </p>
        </div>

        <p className="text-2xl font-bold text-black sm:text-4xl">
            {isLoading ? '...' : isError ? '--' : currentlyClockedIn}
        </p>
        </section>
    );
}

export default CurrentlyClockedInCard;