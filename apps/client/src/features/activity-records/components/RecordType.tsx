import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { RecordType as BaseRecordType } from '../../../../../shared/types/enums.types';

type ApprovalRecordType = Exclude<BaseRecordType, 'attendance'>;

export type RecordTypeFilter = 'all' | ApprovalRecordType;

type RecordTypeProps = {
    value: RecordTypeFilter;
    onChange: (value: RecordTypeFilter) => void;
};

const recordTypeOptions: {
    label: string;
    shortLabel: string;
    value: RecordTypeFilter;
}[] = [
    { label: 'All Records', shortLabel: 'All', value: 'all' },
    { label: 'EoD Report', shortLabel: 'EoD', value: 'eod_report' },
    { label: 'Leave Request', shortLabel: 'Leave', value: 'leave_request' },
    { label: 'Profile Change', shortLabel: 'Profile', value: 'profile_update' },
];

function RecordType({ value, onChange }: RecordTypeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption =
        recordTypeOptions.find((option) => option.value === value) ||
        recordTypeOptions[0];

    return (
        <div className="ml-auto relative w-[120px] shrink-0 sm:w-[170px] lg:w-[180px]">
        <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-9 w-full items-center justify-between rounded-lg bg-white px-3 text-left text-xs text-black shadow-sm outline-none sm:h-10 sm:px-4 sm:text-sm"
        >
            <span className="truncate sm:hidden">{selectedOption.shortLabel}</span>
            <span className="hidden truncate sm:inline">{selectedOption.label}</span>

            <ChevronDown
            size={16}
            className={`shrink-0 transition-transform ${
                isOpen ? 'rotate-180' : ''
            }`}
            />
        </button>

        {isOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-[180px] overflow-hidden rounded-lg bg-white shadow-lg sm:w-full">
            {recordTypeOptions.map((option) => (
                <button
                key={option.value}
                type="button"
                onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#eeeeee] ${
                    value === option.value
                    ? 'bg-[#EAF0FA] font-semibold text-[#002D6F]'
                    : 'text-black'
                }`}
                >
                {option.label}
                </button>
            ))}
            </div>
        )}
        </div>
    );
}

export default RecordType;