import { useState } from 'react';
import type { RecordType } from '../../../../../shared/types/enums.types';
import type { 
    Record, 
    RecordLog 
} from '../../../../../shared/types/record.types';
import LogDetailsModal from './LogDetails';
import LogTypeDropdown, { type LogTypeFilter } from './LogType';
import StatusBadge from './StatusBadge';
import { useFetchRecordsPaginatedIntern } from '../../../api/record.api'

function formatLogType(type: RecordType) {
    switch (type) {
        case 'attendance':
        return 'Attendance';
        case 'eod_report':
        return 'EOD Report';
        case 'leave_request':
        return 'Leave Request';
        case 'profile_update':
        return 'Profile Update';
        default:
        return type;
    }
}

function getPageNumbers(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage, '...', totalPages];
}

function formatDateTime(value: string) {
    const date = new Date(value);

    const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });

    const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${datePart}\n${timePart}`;
}

function TimelineExplorer() {
    const [selectedType, setSelectedType] = useState<LogTypeFilter>('all');
    const [selectedRecord, setSelectedRecord] = useState<RecordLog | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 5;

    const { data: fetchData, isLoading } = useFetchRecordsPaginatedIntern(
        currentPage - 1, 
        rowsPerPage, 
        selectedType === 'all' ? undefined : selectedType
    );

    const records = fetchData?.data ?? [];
    const count = fetchData?.count ?? 0;
    
    const totalPages = count ? Math.ceil(count / rowsPerPage) : 0;

    const pageNumbers = getPageNumbers(currentPage, totalPages);

    const startEntry = count === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;

    const endEntry = Math.min(currentPage * rowsPerPage, count);

    const handleFilterChange = (value: LogTypeFilter) => {
        setSelectedType(value);
        setCurrentPage(1);
    };

    return (
        <>
        <section className="relative flex h-[490px] flex-col rounded-xl bg-white shadow-md">
        {/*<section className="relative rounded-xl bg-white shadow-md">*/}
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold sm:text-2xl">
                Timeline Explorer
            </h2>

            <LogTypeDropdown value={selectedType} onChange={handleFilterChange} />
            </div>

            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            {/*<div className="w-full overflow-x-auto">*/}
            <table className="w-full min-w-[760px] border-collapse">
                <thead className="bg-[#EAF0FA]">
                <tr>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Log Type</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                </tr>
                </thead>

                <tbody>
                {isLoading ? (
                    <tr>
                    <td colSpan={5} className="px-6 py-16">
                        <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                        <p className="text-sm font-semibold text-[#002D6F]">
                            Loading activity logs...
                        </p>
                        </div>
                    </td>
                    </tr>
                ) : records.length > 0 ? (
                    records.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100">
                        <TableCell>
                        <span className="whitespace-pre-line font-bold leading-tight">
                            {formatDateTime(record.display_date)}
                        </span>
                        </TableCell>

                        <TableCell>{formatLogType(record.log_category)}</TableCell>

                        <TableCell>{record.activity_description}</TableCell>

                        <TableCell>
                        {record.log_category !== 'attendance' ? (
                            <StatusBadge status={record.status ? record.status : ''} />
                        ) : (
                            <span className="text-sm text-gray-400">—</span>
                        )}
                        </TableCell>

                        <TableCell>
                        {record.log_category !== 'attendance' ? (
                            <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="text-sm font-medium text-black transition hover:text-[#0058DD]"
                            >
                            View Details
                            </button>
                        ) : (
                            <span className="text-sm text-gray-400">—</span>
                        )}
                        </TableCell>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-sm text-gray-500"
                    >
                        No activity logs found.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </section>

        <div className="flex flex-col gap-3 px-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
            Showing {startEntry} to {endEntry} of {count} entries
            </p>

            <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
                Previous
            </button>

            {pageNumbers.map((page, index) => {
                if (typeof page === 'string') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                        >
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                            currentPage === page
                                ? 'border-[#FFBF10] bg-[#FFBF10] text-black'
                                : 'border-gray-300 bg-white text-black'
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                type="button"
                disabled={totalPages === 0 || currentPage === totalPages}
                onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
                Next
            </button>
            </div>
        </div>

        {selectedRecord && (
            <LogDetailsModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            />
        )}
        </>
    );
}

function TableHead({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-6 py-4 text-left text-sm font-bold text-black">
        {children}
        </th>
    );
}

function TableCell({ children }: { children: React.ReactNode }) {
    return <td className="px-6 py-4 text-sm text-black">{children}</td>;
}

export default TimelineExplorer;