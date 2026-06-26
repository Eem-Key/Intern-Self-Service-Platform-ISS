import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import type { InternPosition } from '../../../../../shared/types/enums.types';

export type PositionFilter = 'all' | InternPosition;

type PositionTypeProps = {
    value: PositionFilter;
    onChange: (value: PositionFilter) => void;
};

const positionOptions: {
    label: string;
    shortLabel: string;
    value: PositionFilter;
}[] = [
    { label: 'All Position', shortLabel: 'All', value: 'all' },
    { label: 'Quality Assurance', shortLabel: 'QA', value: 'quality_assurance' },
    {
        label: 'Front-end Developer',
        shortLabel: 'FE Dev',
        value: 'frontend_developer',
    },
    {
        label: 'Back-end Developer',
        shortLabel: 'BE Dev',
        value: 'backend_developer',
    },
    {
        label: 'Business Analyst',
        shortLabel: 'BA',
        value: 'business_analyst',
    },
];

function PositionType({ value, onChange }: PositionTypeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption =
        positionOptions.find((option) => option.value === value) ||
        positionOptions[0];

    return (
        <div className="relative w-[120px] shrink-0 sm:w-[170px] lg:w-[180px]">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-9 w-full items-center justify-between rounded-lg bg-white px-3 text-left text-xs text-black shadow-sm outline-none sm:h-10 sm:px-4 sm:text-sm"
            >
                <span className="truncate sm:hidden">
                    {selectedOption.shortLabel}
                </span>
                <span className="hidden truncate sm:inline">
                    {selectedOption.label}
                </span>

                <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-30 mt-1 w-[190px] overflow-hidden rounded-lg bg-white shadow-lg sm:w-full">
                    {positionOptions.map((option) => (
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

export default PositionType;