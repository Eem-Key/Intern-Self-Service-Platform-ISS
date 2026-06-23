import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

import DepartmentType, { type DepartmentFilter } from './DepartmentType';
import RecordType, { type RecordTypeFilter } from './RecordType';
import StatusType, { type StatusTypeFilter } from './StatusType';
import DateRange from './DateRange';

type TopFilterBarProps = {
    department: DepartmentFilter;
    recordType: RecordTypeFilter;
    status: StatusTypeFilter;
    startDate: string;
    endDate: string;
    onDepartmentChange: (value: DepartmentFilter) => void;
    onRecordTypeChange: (value: RecordTypeFilter) => void;
    onStatusChange: (value: StatusTypeFilter) => void;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onClearFilters: () => void;
};

function TopFilterBar({
    department,
    recordType,
    status,
    startDate,
    endDate,
    onDepartmentChange,
    onRecordTypeChange,
    onStatusChange,
    onStartDateChange,
    onEndDateChange,
    onClearFilters,
}: TopFilterBarProps) {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const hasFilters =
        department !== 'all' ||
        recordType !== 'all' ||
        status !== 'all' ||
        Boolean(startDate) ||
        Boolean(endDate);

    return (
    <>
        <div className="w-full rounded-t-xl bg-white px-3 py-3 sm:px-4 xl:px-6">
            {/* Mobile / Tablet Filter Button */}
            <div className="flex items-center justify-end gap-3 xl:hidden">
                <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#002D6F] px-4 text-sm font-bold text-white shadow-sm"
                >
                    <SlidersHorizontal size={16} />
                    Filters
                </button>
            </div>

            {/* Desktop / Laptop Inline Filters */}
            <div className="hidden w-full grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_minmax(300px,1.6fr)_auto] items-center gap-3 xl:grid">
                <div className="[&>div]:w-full">
                    <DepartmentType
                        value={department}
                        onChange={onDepartmentChange}
                    />
                </div>

                <div className="[&>div]:w-full">
                    <RecordType
                        value={recordType}
                        onChange={onRecordTypeChange}
                    />
                </div>

                <div className="[&>div]:w-full">
                    <StatusType
                        value={status}
                        onChange={onStatusChange}
                    />
                </div>

                <div className="[&>div]:w-full">
                    <DateRange
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={onStartDateChange}
                        onEndDateChange={onEndDateChange}
                    />
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

        {/* Mobile / Tablet Floating Filter Modal */}
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
                            Filter Records
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

                        <FilterGroup label="Record Type">
                            <RecordType
                                value={recordType}
                                onChange={onRecordTypeChange}
                            />
                        </FilterGroup>

                        <FilterGroup label="Status">
                            <StatusType
                                value={status}
                                onChange={onStatusChange}
                            />
                        </FilterGroup>

                        <FilterGroup label="Date Range">
                            <DateRange
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={onStartDateChange}
                                onEndDateChange={onEndDateChange}
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