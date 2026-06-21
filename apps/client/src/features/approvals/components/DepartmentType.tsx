import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type DepartmentTypeProps = {
    value: string;
    onChange: (value: string) => void;
};

const departmentOptions = [
    { label: 'All Department', value: 'all' },
    { label: 'SDS', value: 'SDS' },
    { label: 'ISS', value: 'ISS' },
];

function DepartmentType({ value, onChange }: DepartmentTypeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel =
        departmentOptions.find((option) => option.value === value)?.label ||
        'All Department';

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full lg:w-[180px]">
        <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex h-10 w-full items-center justify-between rounded-lg bg-white px-4 text-left text-sm shadow-sm outline-none ${
            value ? 'text-black' : 'text-gray-400'
            }`}
        >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown
            size={18}
            className={`shrink-0 text-black transition-transform ${
                isOpen ? 'rotate-180' : ''
            }`}
            />
        </button>

        {isOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-lg">
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