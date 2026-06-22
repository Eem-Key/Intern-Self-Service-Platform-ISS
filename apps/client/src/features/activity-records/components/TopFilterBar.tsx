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
    const hasFilters =
        department !== 'all' ||
        recordType !== 'all' ||
        status !== 'all' ||
        Boolean(startDate) ||
        Boolean(endDate);

    return (
        <div className="w-full rounded-t-xl bg-white px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
            <DepartmentType value={department} onChange={onDepartmentChange} />
            <RecordType value={recordType} onChange={onRecordTypeChange} />
            <StatusType value={status} onChange={onStatusChange} />

            <DateRange
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            />

            <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasFilters}
            className="ml-auto h-9 shrink-0 rounded-lg px-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
            >
            <span className="lg:hidden">Clear</span>
            <span className="hidden lg:inline">Clear Filters</span>
            </button>
        </div>
        </div>
    );
}

export default TopFilterBar;