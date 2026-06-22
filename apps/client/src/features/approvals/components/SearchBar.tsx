import { Search, X } from 'lucide-react';

type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

function SearchBar({ value, onChange }: SearchBarProps) {
    const hasValue = value.trim().length > 0;

    return (
        <div className="relative min-w-0 flex-1">
        <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search by Name..."
            className="h-9 w-full rounded-lg bg-white px-3 pr-16 text-xs shadow-sm outline-none sm:h-10 sm:px-4 sm:pr-20 sm:text-sm"
        />

        {hasValue && (
            <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Clear search"
                className="group absolute right-8 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-black sm:right-9"
            >
                <X size={15} />

                <span className="pointer-events-none absolute top-full right-1/2 mb-1 hidden translate-x-1/2 rounded bg-black px-2 py-1 text-[10px] font-medium text-white shadow-md group-hover:block">
                Clear
                </span>
            </button>
        )}

        <Search
            size={16}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 sm:right-3 sm:size-[18px]"
        />
        </div>
    );
}

export default SearchBar;