import type { ApprovalRecord } from '../../../../../shared/types/approvals.types';

type ActivityRecordCardProps = {
    record: ApprovalRecord;
    onView: () => void;
};

function ActivityRecordCard({ record, onView }: ActivityRecordCardProps) {
    return (
        <div className="flex min-h-[92px] flex-col justify-center gap-3 py-3 lg:min-h-[86px] lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-black sm:text-base">
            {record.name}
            </h3>

            <p className="mt-0.5 truncate text-xs text-black sm:text-sm">
            {record.position || '--'} | {record.department || '--'}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-snug text-gray-600 sm:text-sm">
            {record.description}
            </p>
        </div>

        <button
            type="button"
            onClick={onView}
            className="self-start px-2.5 py-1 text-[11px] font-bold text-[#0058DD] transition hover:bg-[#EAF0FA] lg:self-center"
        >
            View
        </button>
        </div>
    );
}

export default ActivityRecordCard;