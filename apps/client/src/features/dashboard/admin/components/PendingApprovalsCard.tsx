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
    <section className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
      <div>
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF10] text-white">
          <ClipboardList size={24} />
        </span>

        <p className="text-sm font-medium text-gray-700">Pending Approvals</p>
      </div>

      <p className="text-4xl font-bold text-black">
          {isLoading ? '...' : isError ? '--' : pendingCount}
      </p>
    </section>
  );
}

export default PendingApprovalsCard;