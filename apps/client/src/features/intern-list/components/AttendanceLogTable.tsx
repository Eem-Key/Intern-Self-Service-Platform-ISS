import { useState } from 'react';
import { X } from 'lucide-react';

import type { AttendanceRecord } from '../../../../../shared/types/attendance.types';

type AttendanceLogTableProps = {
    records: AttendanceRecord[];
    isLoading?: boolean;
    internName?: string;
    internSubtitle?: string;
};

function formatDate(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

function formatFullDate(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    });
}

function formatTime(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function AttendanceLogTable({
    records,
    isLoading,
    internName = 'Intern',
    internSubtitle = '',
}: AttendanceLogTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const visibleRecords = records.slice(0, 5);

    return (
        <>
            <section className="flex min-h-[360px] flex-col rounded-xl bg-white shadow-md">
                <div className="px-4 py-4 sm:px-5">
                    <h2 className="border-l-4 border-[#FFBF10] pl-2 text-lg font-bold text-black sm:text-xl">
                        Attendance Log
                    </h2>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 lg:px-0 lg:pb-0">
                    {/* Mobile / Tablet Cards */}
                    <div className="space-y-3 lg:hidden">
                        {isLoading && (
                            <LoadingState message="Loading attendance logs..." />
                        )}

                        {!isLoading && visibleRecords.length === 0 && (
                            <EmptyState message="No attendance logs found." />
                        )}

                        {!isLoading &&
                            visibleRecords.map((record) => (
                                <AttendanceCard
                                    key={record.record_id}
                                    record={record}
                                />
                            ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden h-full overflow-y-auto lg:block">
                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[30%]" />
                                <col className="w-[30%]" />
                                <col className="w-[20%]" />
                                <col className="w-[20%]" />
                            </colgroup>

                            <thead className="sticky top-0 z-10 bg-[#EAF0FA]">
                                <tr>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Work Set Up</TableHead>
                                    <TableHead center>Time In</TableHead>
                                    <TableHead center>Time Out</TableHead>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading && (
                                    <tr>
                                        <td colSpan={4} className="h-[240px]">
                                            <LoadingState message="Loading attendance logs..." />
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && visibleRecords.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            No attendance logs found.
                                        </td>
                                    </tr>
                                )}

                                {!isLoading &&
                                    visibleRecords.map((record) => (
                                        <tr
                                            key={record.record_id}
                                            className="border-b border-gray-100"
                                        >
                                           <TableCell>{formatDate(record.work_date)}</TableCell>
                                            <TableCell>{record.work_setup || '--'}</TableCell>
                                            <TableCell center>{formatTime(record.clock_in)}</TableCell>
                                            <TableCell center>{formatTime(record.clock_out)}</TableCell>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {records.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="border-t border-gray-100 bg-[#EAF0FA] py-3 text-sm font-medium text-black transition hover:bg-[#dfeafb]"
                    >
                        View More
                    </button>
                )}
            </section>

            {isModalOpen && (
                <AttendanceLogModal
                    records={records}
                    internName={internName}
                    internSubtitle={internSubtitle}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}

function AttendanceLogModal({
    records,
    internName,
    internSubtitle,
    onClose,
}: {
    records: AttendanceRecord[];
    internName: string;
    internSubtitle: string;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-3 backdrop-blur-sm sm:px-4 xl:left-[270px]">
            <button
                type="button"
                aria-label="Close attendance modal overlay"
                className="fixed inset-0"
                onClick={onClose}
            />

            <div className="relative flex h-[85dvh] max-h-[720px] w-full max-w-[640px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#005de8] to-[#003d8f] px-5 py-4 text-white sm:px-6">
                    <h2 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold sm:text-2xl">
                        Attendance Log
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 transition hover:bg-white/10"
                        aria-label="Close attendance log"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                    <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold text-black sm:text-2xl">
                        {internName}
                    </h3>

                    {internSubtitle && (
                        <p className="pl-2 text-sm text-black">
                            {internSubtitle}
                        </p>
                    )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5 lg:px-0 lg:pb-0">
                    {/* Mobile / Tablet Cards */}
                    <div className="space-y-3 py-4 lg:hidden">
                        {records.length === 0 ? (
                            <EmptyState message="No attendance logs found." />
                        ) : (
                            records.map((record) => (
                                <AttendanceCard
                                    key={record.record_id}
                                    record={record}
                                />
                            ))
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden h-full overflow-auto lg:block">
                        <table className="w-full table-fixed border-collapse">
                        <colgroup>
                            <col className="w-[30%]" />
                            <col className="w-[30%]" />
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                        </colgroup>
                            <thead className="sticky top-0 z-10 bg-[#EAF0FA]">
                                <tr>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Work Set Up</TableHead>
                                    <TableHead center>Time In</TableHead>
                                    <TableHead center>Time Out</TableHead>
                                </tr>
                            </thead>

                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            No attendance logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr
                                            key={record.record_id}
                                            className="border-b border-gray-100"
                                        >
                                            <TableCell center>
                                                {formatFullDate(record.work_date)}
                                            </TableCell>
                                            <TableCell center>
                                                {record.work_setup || '--'}
                                            </TableCell>
                                            <TableCell center>
                                                {formatTime(record.clock_in)}
                                            </TableCell>
                                            <TableCell center>
                                                {formatTime(record.clock_out)}
                                            </TableCell>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AttendanceCard({ record }: { record: AttendanceRecord }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-black">
                        {record.work_setup || '--'}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">Work Set Up</p>
                </div>

                <p className="shrink-0 text-right text-xs font-semibold text-gray-600">
                    {formatDate(record.work_date)}
                </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#F7F7F7] p-3">
                <div>
                    <p className="text-[11px] font-semibold text-gray-500">
                        Time In
                    </p>
                    <p className="mt-1 text-xs font-bold text-black">
                        {formatTime(record.clock_in)}
                    </p>
                </div>

                <div>
                    <p className="text-[11px] font-semibold text-gray-500">
                        Time Out
                    </p>
                    <p className="mt-1 text-xs font-bold text-black">
                        {formatTime(record.clock_out)}
                    </p>
                </div>
            </div>
        </div>
    );
}

function TableHead({
    children,
    center = false,
}: {
    children: React.ReactNode;
    center?: boolean;
}) {
    return (
        <th
            className={`whitespace-nowrap px-4 py-4 text-sm font-bold text-black ${
                center ? 'text-center' : 'text-left'
            }`}
        >
            {children}
        </th>
    );
}

function TableCell({
    children,
    center = false,
}: {
    children: React.ReactNode;
    center?: boolean;
}) {
    return (
        <td
            className={`truncate px-4 py-4 text-sm text-black ${
                center ? 'text-center' : 'text-left'
            }`}
        >
            {children}
        </td>
    );
}

function LoadingState({ message }: { message: string }) {
    return (
        <div className="flex h-[240px] flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
            <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-10 text-center text-sm text-gray-500">
            {message}
        </div>
    );
}

export default AttendanceLogTable;