import type { ApprovalTab } from '../../../../../shared/types/approvals.types';

type TopFilterBarProps = {
    activeTab: ApprovalTab;
    onChange: (tab: ApprovalTab) => void;
    counts: {
        eod_report: number;
        leave_request: number;
        profile_update: number;
    };
};

const tabs: { label: string; shortLabel: string; value: ApprovalTab }[] = [
    { label: 'EoD Report', shortLabel: 'EoD', value: 'eod_report' },
    { label: 'Leave Request', shortLabel: 'Leave', value: 'leave_request' },
    { label: 'Profile Change', shortLabel: 'Profile', value: 'profile_update' },
];

function TopFilterBar({ activeTab, onChange, counts }: TopFilterBarProps) {
    return (
        <div className="grid grid-cols-3 border-b border-gray-100">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
            <button
                key={tab.value}
                type="button"
                onClick={() => onChange(tab.value)}
                className={`flex min-w-0 items-center justify-center gap-1 border-b-4 px-1.5 py-3 text-[11px] font-bold transition sm:gap-2 sm:px-4 sm:py-4 sm:text-sm ${
                isActive
                    ? 'border-[#FFBF10] text-[#002D6F]'
                    : 'border-transparent text-[#002D6F] hover:bg-gray-50'
                }`}
            >
                <span className="truncate sm:hidden">{tab.shortLabel}</span>
                <span className="hidden truncate sm:inline">{tab.label}</span>

                <span className="shrink-0 rounded bg-[#002D6F] px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
                {counts[tab.value] || 0}
                </span>
            </button>
            );
        })}
        </div>
    );
}

export default TopFilterBar;