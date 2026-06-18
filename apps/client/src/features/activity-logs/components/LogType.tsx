import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { RecordType } from '../../../../../shared/types/enums.types';

export type LogTypeFilter = 'all' | RecordType;

type LogTypeDropdownProps = {
    value: LogTypeFilter;
    onChange: (value: LogTypeFilter) => void;
};

const logTypeOptions: { label: string; value: LogTypeFilter }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Attendance', value: 'attendance' },
    { label: 'EOD Report', value: 'eod_report' },
    { label: 'Leave Request', value: 'leave_request' },
    { label: 'Profile Update', value: 'profile_update' },
];

function LogTypeDropdown({ value, onChange }: LogTypeDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel =
        logTypeOptions.find((option) => option.value === value)?.label ||
        'All Types';

    return (
        <div className="relative w-full sm:w-[190px]">
        <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-10 w-full items-center justify-between rounded-lg bg-white px-4 text-sm font-medium shadow-md transition hover:bg-gray-50"
        >
            <span>{selectedLabel}</span>
            <ChevronDown size={16} />
        </button>

        {isOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-xl">
            {logTypeOptions.map((option) => (
                <button
                key={option.value}
                type="button"
                onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#eeeeee] ${
                    value === option.value
                    ? 'bg-[#eeeeee] font-semibold text-black'
                    : 'text-gray-700'
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

export default LogTypeDropdown;