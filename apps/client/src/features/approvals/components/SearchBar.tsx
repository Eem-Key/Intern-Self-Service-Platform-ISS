import { Search } from 'lucide-react';

type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative min-w-0 flex-1">
        <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search by Name"
            className="h-9 w-full rounded-lg bg-white px-3 pr-8 text-xs shadow-sm outline-none sm:h-10 sm:px-4 sm:pr-10 sm:text-sm"
        />

        <Search
            size={16}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 sm:right-3 sm:size-[18px]"
        />
        </div>
    );
}

export default SearchBar;