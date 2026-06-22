import { ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPendingRequests } from '../../../../api/adminDashboard.api';

function PendingApprovalsCard() {
  const {
        data: pendingCount = 0,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['admin-pending-requsts'],
        queryFn: fetchPendingRequests,
    }); 
  
  return (
    <section className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-white px-2 py-3 shadow-md sm:px-6 sm:py-4">
      <div>
        <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFBF10] text-white sm:mb-4 sm:h-12 sm:w-12">
          <ClipboardList size={18} className="sm:h-6 sm:w-6" />
        </span>

        <p className="text-[10px] font-medium leading-tight text-gray-700 sm:text-sm">
          Pending Approvals
        </p>
      </div>

      <p className="text-2xl font-bold text-black sm:text-4xl">
          {isLoading ? '...' : isError ? '--' : pendingCount}
      </p>
    </section>
  );
}

export default PendingApprovalsCard;