import { ClipboardList } from 'lucide-react';

type PendingApprovalsCardProps = {
  value: number;
};

function PendingApprovalsCard({ value }: PendingApprovalsCardProps) {
  return (
    <section className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
      <div>
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF10] text-white">
          <ClipboardList size={24} />
        </span>

        <p className="text-sm font-medium text-gray-700">Pending Approvals</p>
      </div>

      <p className="text-4xl font-bold text-black">{value}</p>
    </section>
  );
}

export default PendingApprovalsCard;