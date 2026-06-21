import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type DepartmentTypeProps = {
    value: string;
    onChange: (value: string) => void;
};

const departmentOptions = [
    { label: 'All Department', shortLabel: 'All Dept...', value: 'all' },
    { label: 'SDS', shortLabel: 'SDS', value: 'SDS' },
    { label: 'ISS', shortLabel: 'ISS', value: 'ISS' },
];

function DepartmentType({ value, onChange }: DepartmentTypeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption =
        departmentOptions.find((option) => option.value === value) ||
        departmentOptions[0];

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setIsOpen(false);
    };

    return (
        <div className="relative w-[125px] shrink-0 sm:w-[170px] lg:w-[180px]">
        <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-9 w-full items-center justify-between rounded-lg bg-white px-3 text-left text-xs text-black shadow-sm outline-none sm:h-10 sm:px-4 sm:text-sm"
        >
            <span className="truncate sm:hidden">{selectedOption.shortLabel}</span>
            <span className="hidden truncate sm:inline">{selectedOption.label}</span>

            <ChevronDown
            size={16}
            className={`shrink-0 text-black transition-transform ${
                isOpen ? 'rotate-180' : ''
            }`}
            />
        </button>

        {isOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-[170px] overflow-hidden rounded-lg bg-white shadow-lg sm:w-full">
            {departmentOptions.map((option) => (
                <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
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

export default DepartmentType;