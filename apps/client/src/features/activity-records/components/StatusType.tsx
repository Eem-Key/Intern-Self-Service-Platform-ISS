import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export type StatusTypeFilter = 'all' | 'approved' | 'denied';

type StatusTypeProps = {
    value: StatusTypeFilter;
    onChange: (value: StatusTypeFilter) => void;
};

const statusOptions: { label: string; value: StatusTypeFilter }[] = [
    { label: 'Status', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Denied', value: 'denied' },
];

function StatusType({ value, onChange }: StatusTypeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel =
        statusOptions.find((option) => option.value === value)?.label || 'Status';

    return (
        <div className="relative w-[110px] shrink-0 sm:w-[150px] lg:w-[150px]">
        <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-9 w-full items-center justify-between rounded-lg bg-white px-3 text-left text-xs text-black shadow-sm outline-none sm:h-10 sm:px-4 sm:text-sm"
        >
            <span className="truncate">{selectedLabel}</span>

            <ChevronDown
            size={16}
            className={`shrink-0 transition-transform ${
                isOpen ? 'rotate-180' : ''
            }`}
            />
        </button>

        {isOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-lg">
            {statusOptions.map((option) => (
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

export default StatusType;