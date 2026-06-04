// MOCK FOR TESTING

import type {
    AttendanceRecord,
    TimeInPayload,
    TimeInResponse,
    TimeOutResponse,
    TodayAttendanceResponse,
} from '../../../shared/types/attendance.types';

const MOCK_ATTENDANCE_KEY = 'mockTodayAttendance';

function getMockAttendance(): AttendanceRecord | null {
  const savedAttendance = localStorage.getItem(MOCK_ATTENDANCE_KEY);

    if (!savedAttendance) {
        return null;
    }

    return JSON.parse(savedAttendance) as AttendanceRecord;
}

function saveMockAttendance(attendance: AttendanceRecord) {
    localStorage.setItem(MOCK_ATTENDANCE_KEY, JSON.stringify(attendance));
}

export async function getTodayAttendanceAPI(): Promise<TodayAttendanceResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
        message: 'Today attendance fetched successfully',
        data: getMockAttendance(),
    };
}

export async function timeInAPI(
    payload: TimeInPayload
): Promise<TimeInResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const existingAttendance = getMockAttendance();

    if (existingAttendance) {
        throw new Error(
        'Work setup can no longer be changed for today. Please contact your immediate supervisor to change it or note it in your EOD report.'
        );
    }

    const today = new Date();

    const attendance: AttendanceRecord = {
        id: crypto.randomUUID(),
        intern_id: 'mock-intern-id',
        clock_in: today.toISOString(),
        clock_out: null,
        work_date: today.toISOString().slice(0, 10),
        hours_logged: null,
        work_setup: payload.workSetup,
    };

    saveMockAttendance(attendance);

    return {
        message: 'Time in successful',
        data: attendance,
    };
    }

export async function timeOutAPI(): Promise<TimeOutResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const existingAttendance = getMockAttendance();

    if (!existingAttendance?.clock_in) {
        throw new Error('You need to time in first.');
    }

    if (existingAttendance.clock_out) {
        throw new Error('You have already timed out for today.');
    }

    const clockOut = new Date();
    const clockIn = new Date(existingAttendance.clock_in);

    const hoursLogged =
        (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

    const updatedAttendance: AttendanceRecord = {
        ...existingAttendance,
        clock_out: clockOut.toISOString(),
        hours_logged: Number(hoursLogged.toFixed(2)),
    };

    saveMockAttendance(updatedAttendance);

    return {
        message: 'Time out successful',
        data: updatedAttendance,
    };
}