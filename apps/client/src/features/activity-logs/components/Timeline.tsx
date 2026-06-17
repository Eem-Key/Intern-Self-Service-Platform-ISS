import { useMemo, useState } from 'react';
import type { LogType } from '../../../../../shared/types/enums.types';
import { mockActivityLogs } from '../data/MockActivityLogs';
import type { ActivityLog } from '../../../../../shared/types/activityLog.types';
import LogDetailsModal from './LogDetails';
import LogTypeDropdown, { type LogTypeFilter } from './LogType';
import StatusBadge from './StatusBadge';

function formatLogType(type: LogType) {
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
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 5;

    // replace with API
    const logs = mockActivityLogs;

    const filteredLogs = useMemo(() => {
        if (selectedType === 'all') return logs;

        return logs.filter((log) => log.type === selectedType);
        }, [logs, selectedType]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));

    const visibleLogs = filteredLogs.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const startEntry =
        filteredLogs.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;

    const endEntry = Math.min(currentPage * rowsPerPage, filteredLogs.length);

    const handleFilterChange = (value: LogTypeFilter) => {
        setSelectedType(value);
        setCurrentPage(1);
    };

    return (
        <>
        <section className="relative rounded-xl bg-white shadow-md">
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold sm:text-2xl">
                Timeline Explorer
            </h2>

            <LogTypeDropdown value={selectedType} onChange={handleFilterChange} />
            </div>

            <div className="w-full overflow-x-auto">
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
                {visibleLogs.length > 0 ? (
                    visibleLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100">
                        <TableCell>
                        <span className="whitespace-pre-line font-bold leading-tight">
                            {formatDateTime(log.submitted_at)}
                        </span>
                        </TableCell>

                    <TableCell>{formatLogType(log.type)}</TableCell>

                    <TableCell>{log.activity}</TableCell>

                    <TableCell>
                    {log.type !== 'attendance' ? (
                        <StatusBadge status={log.status} />
                    ) : (
                        <span className="text-sm text-gray-400">—</span>
                    )}
                    </TableCell>

                    <TableCell>
                    {log.type !== 'attendance' ? (
                        <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
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
                        className="px-6 py-10 text-center text-sm text-gray-500"
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
            Showing {startEntry} to {endEntry} of {filteredLogs.length} entries
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

            {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

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
                disabled={currentPage === totalPages}
                onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
                Next
            </button>
            </div>
        </div>

        {selectedLog && (
            <LogDetailsModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
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