import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { AttendanceWithName } from '../../../../../../shared/types/attendance.types';
import { fetchAttendancePerDateRange } from '../../../../api/adminDashboard.api';

function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

// mock data
/*const mockAttendanceRecords: AttendanceWithName[] = [
    {
    id: 'attendance-1',
    intern_id: 'intern-1',
    clock_in: '2026-06-16T08:15:00',
    clock_out: '2026-06-16T17:30:00',
    work_date: '2026-06-16',
    hours_logged: 8,
    work_setup: 'onsite',
    Name: {
        first_name: 'Joehanna',
        middle_name: null,
        last_name: 'Cansino',
        suffix: null,
        },
    },
    {
    id: 'attendance-2',
    intern_id: 'intern-2',
    clock_in: '2026-06-16T09:00:00',
    clock_out: null,
    work_date: '2026-06-16',
    hours_logged: null,
    work_setup: 'wfh',
    Name: {
        first_name: 'Miggy',
        middle_name: null,
        last_name: 'Santos',
        suffix: null,
        },
    },
    {
    id: 'attendance-3',
    intern_id: 'intern-3',
    clock_in: '2026-06-16T08:45:00',
    clock_out: '2026-06-16T16:45:00',
    work_date: '2026-06-16',
    hours_logged: 8,
    work_setup: 'onsite',
    Name: {
        first_name: 'Ana',
        middle_name: 'Reyes',
        last_name: 'Dela Cruz',
        suffix: null,
        },
    },
    {
    id: 'attendance-4',
    intern_id: 'intern-4',
    clock_in: '2026-06-16T10:20:00',
    clock_out: null,
    work_date: '2026-06-16',
    hours_logged: null,
    work_setup: 'wfh',
    Name: {
        first_name: 'Carlo',
        middle_name: null,
        last_name: 'Garcia',
        suffix: null,
        },
    },
    {
    id: 'attendance-5',
    intern_id: 'intern-5',
    clock_in: '2026-06-15T10:20:00',
    clock_out: null,
    work_date: '2026-06-15',
    hours_logged: null,
    work_setup: 'wfh',
    Name: {
        first_name: 'Carlo',
        middle_name: null,
        last_name: 'Go',
        suffix: null,
        },
    },
];*/

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

    // mock testing
    /*const attendanceRecords = mockAttendanceRecords.filter((record) => {
    return record.work_date >= startDate && record.work_date <= endDate;
    });

    const isLoading = false;
    const isError = false;
    const error = null;*/

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
        <section className="flex min-w-0 flex-col rounded-xl bg-white shadow-md">
        <div className="flex shrink-0 flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold sm:text-3xl">
            Attendance Tracker
            </h2>

            <div className="flex w-full items-center rounded-xl bg-[#FFF3C4] px-3 py-2 text-[#9A6B00] ring-1 ring-[#FFE28A] sm:w-auto">
            

            <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex min-w-0 items-center gap-1">
                <span className="text-sm font-semibold text-[#9A6B00]/70">
                    From
                </span>

                <input
                    type="date"
                    value={startDate}
                    onChange={(event) => handleStartDateChange(event.target.value)}
                    className="w-[125px] bg-transparent text-xs font-semibold text-[#9A6B00] outline-none"
                />
                </div>

                <span className="mx-2 h-6 w-px bg-[#D8A600]/35" />

                <div className="flex min-w-0 items-center gap-1">
                <span className="text-sm font-semibold text-[#9A6B00]/70">
                    To
                </span>

                <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(event) => handleEndDateChange(event.target.value)}
                    className="w-[125px] bg-transparent text-xs font-semibold text-[#9A6B00] outline-none"
                />
                </div>
            </div>
            </div>
        </div>

        <div className="max-h-[320px] overflow-auto sm:max-h-[380px] md:max-h-[420px] lg:max-h-[calc(100vh-360px)] xl:max-h-[calc(100vh-280px)]">
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
                    <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                    Loading attendance records...
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
                    key={attendance.id}
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

    const fullName = [
        attendance.Name.first_name,
        attendance.Name.middle_name,
        attendance.Name.last_name,
        attendance.Name.suffix,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return fullName || '--';
}

export default AttendanceTracker;