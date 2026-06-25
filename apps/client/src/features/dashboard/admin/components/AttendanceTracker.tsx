import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AttendanceWithName } from '../../../../../../shared/types/attendance.types';
import { fetchAttendancePerDateRange } from '../../../../api/adminDashboard.api';

function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

function AttendanceTracker() {
    const today = getTodayDateString();

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const {
        data: attendanceRecords = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['admin-attendance-tracker', startDate, endDate],
        queryFn: () => fetchAttendancePerDateRange(startDate, endDate),
    });

    const handleStartDateChange = (newStartDate: string) => {
        setStartDate(newStartDate);

        if (newStartDate > endDate) {
        setEndDate(newStartDate);
        }
    };

    const handleEndDateChange = (newEndDate: string) => {
        setEndDate(newEndDate);
    };

    return (
        <section className="flex max-h-[620px] min-h-[430px] min-w-0 flex-col rounded-xl bg-white shadow-md lg:h-[calc(100vh-360px)] xl:h-[calc(100vh-280px)] xl:max-h-[520px]">
        {/*<section className="flex h-[360px] min-h-0 min-w-0 flex-col rounded-xl bg-white shadow-md sm:h-[420px] lg:h-[calc(100vh-360px)] xl:h-[calc(100vh-280px)] xl:max-h-[520px]">*/}
        {/*</section><section className="flex min-w-0 flex-col rounded-xl bg-white shadow-md">*/}
        <div className="flex shrink-0 flex-col gap-3 px-3 py-4 sm:px-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="shrink-0 border-l-4 border-[#FFBF10] pl-2 text-xl font-bold sm:pl-3 sm:text-2xl">
                Attendance Tracker
            </h2>

            <div className="w-full rounded-xl bg-[#FFF3C4] px-3 py-2 text-[#9A6B00] ring-1 ring-[#FFE28A] lg:w-auto">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                <div className="grid min-w-0 grid-cols-[42px_minmax(0,1fr)] items-center gap-2 sm:flex sm:items-center sm:gap-1.5">
                <span className="shrink-0 text-[10px] font-semibold text-[#9A6B00]/70 sm:text-xs xl:text-sm">
                    From
                </span>

                <input
                    type="date"
                    value={startDate}
                    onChange={(event) => handleStartDateChange(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-right font-semibold leading-none text-[#9A6B00] outline-none
                    [&::-webkit-datetime-edit]:text-[10px]
                    [&::-webkit-datetime-edit-fields-wrapper]:text-[10px]
                    [&::-webkit-datetime-edit-text]:px-0
                    [&::-webkit-calendar-picker-indicator]:ml-0.5
                    [&::-webkit-calendar-picker-indicator]:h-3.5
                    [&::-webkit-calendar-picker-indicator]:w-3.5
                    [&::-webkit-calendar-picker-indicator]:p-0
                    sm:[&::-webkit-datetime-edit]:text-xs
                    sm:[&::-webkit-datetime-edit-fields-wrapper]:text-xs
                    xl:[&::-webkit-datetime-edit]:text-sm
                    xl:[&::-webkit-datetime-edit-fields-wrapper]:text-sm"
                />
                </div>

                <span className="hidden h-6 w-px bg-[#D8A600]/35 sm:block" />

                <div className="grid min-w-0 grid-cols-[42px_minmax(0,1fr)] items-center gap-2 sm:flex sm:items-center sm:gap-1.5">
                <span className="shrink-0 text-[10px] font-semibold text-[#9A6B00]/70 sm:text-xs xl:text-sm">
                    To
                </span>

                <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(event) => handleEndDateChange(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-right font-semibold leading-none text-[#9A6B00] outline-none
                    [&::-webkit-datetime-edit]:text-[10px]
                    [&::-webkit-datetime-edit-fields-wrapper]:text-[10px]
                    [&::-webkit-datetime-edit-text]:px-0
                    [&::-webkit-calendar-picker-indicator]:ml-0.5
                    [&::-webkit-calendar-picker-indicator]:h-3.5
                    [&::-webkit-calendar-picker-indicator]:w-3.5
                    [&::-webkit-calendar-picker-indicator]:p-0
                    sm:[&::-webkit-datetime-edit]:text-xs
                    sm:[&::-webkit-datetime-edit-fields-wrapper]:text-xs
                    xl:[&::-webkit-datetime-edit]:text-sm
                    xl:[&::-webkit-datetime-edit-fields-wrapper]:text-sm"
                />
                </div>
            </div>
            </div>
        </div>

        
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 lg:px-0 lg:pb-0">
        {/* Mobile / Tablet Card Layout */}
        <div className="space-y-3 lg:hidden">
            {isLoading && (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                <p className="text-sm font-medium text-gray-500">
                Loading attendance records...
                </p>
            </div>
            )}

            {isError && (
            <div className="py-10 text-center text-sm text-red-600">
                {error instanceof Error
                ? error.message
                : 'Unable to load attendance records.'}
            </div>
            )}

            {!isLoading &&
            !isError &&
            attendanceRecords.length > 0 &&
            attendanceRecords.map((attendance) => (
                <div
                key={attendance.record_id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-black">
                        {getAttendanceName(attendance)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        {attendance.work_setup || '--'}
                    </p>
                    </div>

                    <p className="shrink-0 text-right text-xs font-semibold text-gray-600">
                    {formatDate(attendance.work_date)}
                    </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#F7F7F7] p-3">
                    <div>
                    <p className="text-[11px] font-semibold text-gray-500">
                        Time In
                    </p>
                    <p className="mt-1 text-xs font-bold text-black">
                        {formatTime(attendance.clock_in)}
                    </p>
                    </div>

                    <div>
                    <p className="text-[11px] font-semibold text-gray-500">
                        Time Out
                    </p>
                    <p className="mt-1 text-xs font-bold text-black">
                        {formatTime(attendance.clock_out)}
                    </p>
                    </div>
                </div>
                </div>
            ))}

            {!isLoading && !isError && attendanceRecords.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
                No attendance records found.
            </div>
            )}
        </div>

        {/*Desktop*/}
        <div className="hidden h-full overflow-auto lg:block">
            <table className="w-full min-w-[720px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#EAF0FA]">
                <tr>
                <TableHead>Name</TableHead>
                <TableHead>Work Set Up</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                </tr>
            </thead>

            <tbody>
                {isLoading && (
                <tr>
                    <td colSpan={5} className="h-[300px] px-6 py-10">
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                        <p className="text-sm font-medium text-gray-500">
                        Loading attendance records...
                        </p>
                    </div>
                    </td>
                </tr>
                )}

                {isError && (
                <tr>
                    <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-red-600"
                    >
                    {error instanceof Error
                        ? error.message
                        : 'Unable to load attendance records.'}
                    </td>
                </tr>
                )}

                {!isLoading &&
                !isError &&
                attendanceRecords.length > 0 &&
                attendanceRecords.map((attendance) => (
                    <tr
                    key={attendance.record_id}
                    className="border-b border-gray-100"
                    >
                    <TableCell>{getAttendanceName(attendance)}</TableCell>
                    <TableCell>{attendance.work_setup || '--'}</TableCell>
                    <TableCell>{formatDate(attendance.work_date)}</TableCell>
                    <TableCell>{formatTime(attendance.clock_in)}</TableCell>
                    <TableCell>{formatTime(attendance.clock_out)}</TableCell>
                    </tr>
                ))}

                {!isLoading && !isError && attendanceRecords.length === 0 && (
                <tr>
                    <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                    No attendance records found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
        </section>
    );
}

function TableHead({ children }: { children: React.ReactNode }) {
    return (
        <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-bold text-black">
        {children}
        </th>
    );
}

function TableCell({ children }: { children: React.ReactNode }) {
    return (
        <td className="whitespace-nowrap px-6 py-4 text-sm text-black">
        {children}
        </td>
    );
}

function formatDate(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
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

function getAttendanceName(attendance: AttendanceWithName) {
    if (!attendance.Name) return '--';

    const middleInitial = attendance.Name.middle_name
        ? `${attendance.Name.middle_name.charAt(0).toUpperCase()}.`
        : null;

    const fullName = [
        attendance.Name.first_name,
        middleInitial,
        attendance.Name.last_name,
        attendance.Name.suffix,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return fullName || '--';
}

export default AttendanceTracker; 
