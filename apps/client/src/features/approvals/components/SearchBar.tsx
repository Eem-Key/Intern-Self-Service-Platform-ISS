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
            placeholder="Search by Name..."
            className="h-10 w-full rounded-lg bg-white px-4 pr-10 text-sm shadow-sm outline-none"
        />

        <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        </div>
    );
}

export default SearchBar;