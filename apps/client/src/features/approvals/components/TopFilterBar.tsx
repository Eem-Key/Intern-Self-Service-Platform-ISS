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

const tabs: { label: string; value: ApprovalTab }[] = [
    { label: 'EoD Report', value: 'eod_report' },
    { label: 'Leave Request', value: 'leave_request' },
    { label: 'Profile Change', value: 'profile_update' },
];

function TopFilterBar({ activeTab, onChange, counts }: TopFilterBarProps) {
    return (
        <div className="grid grid-cols-1 border-b border-gray-100 sm:grid-cols-3">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
            <button
                key={tab.value}
                type="button"
                onClick={() => onChange(tab.value)}
                className={`flex items-center justify-center gap-2 border-b-4 px-4 py-4 text-sm font-bold transition ${
                isActive
                    ? 'border-[#FFBF10] text-[#002D6F]'
                    : 'border-transparent text-[#002D6F] hover:bg-gray-50'
                }`}
            >
                {tab.label}

                <span className="rounded bg-[#002D6F] px-1.5 py-0.5 text-xs font-bold text-white">
                {counts[tab.value] || 0}
                </span>
            </button>
            );
        })}
        </div>
    );
}

export default TopFilterBar;