import { useQuery } from '@tanstack/react-query';
import { UsersRound } from 'lucide-react';

import { fetchActiveInternsAPI } from '../../../../api/admin/admin.dashboard.api';

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
        <section className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-white px-2 py-3 shadow-md sm:px-6 sm:py-4">
        <div>
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0058DD] text-white sm:mb-4 sm:h-12 sm:w-12">
                <UsersRound size={18} className="sm:h-6 sm:w-6" />
            </span>

            <p className="text-[10px] font-medium leading-tight text-gray-700 sm:text-sm">
                Active Interns
            </p>
        </div>

        <p className="text-2xl font-bold text-black sm:text-4xl">
            {isLoading ? '...' : isError ? '--' : activeInterns}
        </p>
        </section>
    );
}

export default ActiveInternsCard;