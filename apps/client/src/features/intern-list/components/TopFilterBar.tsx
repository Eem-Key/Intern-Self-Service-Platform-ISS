import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

import SearchBar from './SearchBar';
import DepartmentType, { type DepartmentFilter } from './DepartmentType';
import PositionType, { type PositionFilter } from './PositionType';
import StatusType, { type StatusTypeFilter } from './StatusType';

type TopFilterBarProps = {
    searchValue: string;
    department: DepartmentFilter;
    position: PositionFilter;
    status: StatusTypeFilter;
    onSearchChange: (value: string) => void;
    onDepartmentChange: (value: DepartmentFilter) => void;
    onPositionChange: (value: PositionFilter) => void;
    onStatusChange: (value: StatusTypeFilter) => void;
    onClearFilters: () => void;
};

function TopFilterBar({
    searchValue,
    department,
    position,
    status,
    onSearchChange,
    onDepartmentChange,
    onPositionChange,
    onStatusChange,
    onClearFilters,
}: TopFilterBarProps) {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const hasFilters =
        searchValue.trim().length > 0 ||
        department !== 'all' ||
        position !== 'all' ||
        status !== 'all';

    return (
        <>
            <div className="w-full rounded-t-xl bg-white px-3 py-3 sm:px-4 xl:px-6">
                {/* Mobile / Tablet */}
                <div className="flex items-center gap-3 xl:hidden">
                    <SearchBar value={searchValue} onChange={onSearchChange} />

                    <button
                        type="button"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#002D6F] px-4 text-sm font-bold text-white shadow-sm"
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>
                </div>

                {/* Desktop / Laptop */}
                <div className="hidden w-full grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(130px,0.7fr)_auto] items-center gap-3 xl:grid">
                    <SearchBar value={searchValue} onChange={onSearchChange} />

                    <div className="[&>div]:w-full">
                        <DepartmentType
                            value={department}
                            onChange={onDepartmentChange}
                        />
                    </div>

                    <div className="[&>div]:w-full">
                        <PositionType
                            value={position}
                            onChange={onPositionChange}
                        />
                    </div>

                    <div className="[&>div]:w-full">
                        <StatusType value={status} onChange={onStatusChange} />
                    </div>

                    <button
                        type="button"
                        onClick={onClearFilters}
                        disabled={!hasFilters}
                        className="h-10 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {isFilterModalOpen && (
                <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center xl:hidden">
                    <button
                        type="button"
                        aria-label="Close filter overlay"
                        className="fixed inset-0"
                        onClick={() => setIsFilterModalOpen(false)}
                    />

                    <div className="relative w-full max-w-[460px] rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h2 className="text-lg font-bold text-[#002D6F]">
                                Filter Interns
                            </h2>

                            <button
                                type="button"
                                onClick={() => setIsFilterModalOpen(false)}
                                className="rounded-full p-1 transition hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-5">
                            <FilterGroup label="Department">
                                <DepartmentType
                                    value={department}
                                    onChange={onDepartmentChange}
                                />
                            </FilterGroup>

                            <FilterGroup label="Position">
                                <PositionType
                                    value={position}
                                    onChange={onPositionChange}
                                />
                            </FilterGroup>

                            <FilterGroup label="Status">
                                <StatusType
                                    value={status}
                                    onChange={onStatusChange}
                                />
                            </FilterGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={onClearFilters}
                                disabled={!hasFilters}
                                className="h-10 rounded-full border border-gray-300 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsFilterModalOpen(false)}
                                className="h-10 rounded-full bg-[#FFBF10] text-sm font-bold text-black"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function FilterGroup({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <p className="mb-2 text-sm font-bold text-black">{label}</p>
            <div className="[&>div]:w-full [&_button]:w-full">
                {children}
            </div>
        </div>
    );
}

export default TopFilterBar;