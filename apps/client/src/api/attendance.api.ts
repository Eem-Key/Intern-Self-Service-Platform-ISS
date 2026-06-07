import { supabase } from '../config/supabase';
import { getAuthUserId } from '../utils/auth';
import type {
    AttendanceRecord,
    TimeInResponse,
    TimeOutResponse,
    WorkSetup,
} from '../../../shared/types/attendance.types';

export async function getActiveAttendanceAPI(): Promise<AttendanceRecord | null> {
    const intern_id = await getAuthUserId();
    if (!intern_id) return null;

    const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('intern_id', intern_id)
        .is('clock_out', null)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getAttendanceByDateAPI(date: string): Promise<AttendanceRecord | null> {
    const intern_id = await getAuthUserId();
    if (!intern_id) return null;

    const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('intern_id', intern_id)
        .gte('clock_in', `${date} 00:00:00`)
        .lte('clock_in', `${date} 23:59:59`)
        .single();

    if (error) throw error;
    return data;
}

export async function timeInAPI(
    setup: WorkSetup
): Promise<TimeInResponse> {
    const intern_id = await getAuthUserId();
    
    if (!intern_id) {
        throw new Error('You must be logged in to time in.');
    }

    const { data: existingLog, error: checkError } = await supabase
        .from('attendance_logs')
        .select('id')
        .eq('intern_id', intern_id)
        .is('clock_out', null)
        .maybeSingle();

    if (checkError) throw checkError;

    if (existingLog) {
        throw new Error('You have an active session. Please clock out of your current log before starting a new one.');
    }

    const { data: timein, error: insertError } = await supabase
        .from('attendance_logs')
        .insert([
        {
            intern_id: intern_id,
            work_setup: setup,
        },
        ])
        .select()
        .single();

        if (insertError) {
            console.error('Error inserting attendance log:', insertError);
            throw insertError;
        }

    const timeinAttendanceRecord = timein as AttendanceRecord;

    return {
        message: 'Time in successful',
        data: {
            id: timeinAttendanceRecord.id,
            intern_id: intern_id,
            clock_in: timeinAttendanceRecord.clock_in,
            clock_out: null,
            work_date: timeinAttendanceRecord.work_date,
            hours_logged: null,
            work_setup: timeinAttendanceRecord.work_setup,
        },
    };
}

export async function timeOutAPI(
    attendanceId: string
): Promise<TimeOutResponse> {
    const intern_id = await getAuthUserId();
    
    if (!intern_id) {
        throw new Error('You must be logged in to time out.');
    }

    const { data: log, error: checkError } = await supabase
        .from('attendance_logs')
        .select('clock_in, clock_out')
        .eq('id', attendanceId)
        .eq('intern_id', intern_id)
        .single();
    
    if (checkError || !log) {
        throw new Error('Attendance log not found.');
    }

    if (log.clock_out !== null) {
        throw new Error('You have already timed out for this session.');
    }

    const clockInDate = new Date(log.clock_in);
    const now = new Date();
    const totalDiffInMs = now.getTime() - clockInDate.getTime();

    const lunchStart = new Date(clockInDate);
    lunchStart.setHours(12, 0, 0, 0);
    const lunchEnd = new Date(clockInDate);
    lunchEnd.setHours(13, 0, 0, 0);

    let lunchDurationInMs = 0;

    if (now > lunchStart) {
        // timed in before lunch and timed out after lunch
        if (clockInDate < lunchStart && now > lunchEnd) {
            lunchDurationInMs = 1000 * 60 * 60;
        } 
        // timed in during lunch and timed out after
        else if (clockInDate >= lunchStart && clockInDate < lunchEnd && now > lunchEnd) {
            lunchDurationInMs = lunchEnd.getTime() - clockInDate.getTime();
        }
        // timed in before lunch and timed out during lunch
        else if (clockInDate < lunchStart && now >= lunchStart && now < lunchEnd) {
            lunchDurationInMs = now.getTime() - lunchStart.getTime();
        }
    }

    const netDiffInMs = totalDiffInMs - lunchDurationInMs;
    const hours_logged = Math.floor(netDiffInMs / (1000 * 60 * 60));

    const { data: timeout, error: updateError } = await supabase
        .from('attendance_logs')
        .update({
            clock_out: now.toISOString(),
            hours_logged: hours_logged,
        })
        .eq('id', attendanceId)
        .eq('intern_id', intern_id)
        .is('clock_out', null)
        .select()
        .single()

    if (updateError) {
        throw new Error(`Failed to clock out: ${updateError.message}`);
    }

    const timeoutAttendanceRecord = timeout as AttendanceRecord;

    return {
        message: 'Time out successful',
        data: {
            id: timeoutAttendanceRecord.id,
            intern_id: intern_id,
            clock_in: timeoutAttendanceRecord.clock_in,
            clock_out: timeoutAttendanceRecord.clock_out,
            work_date: timeoutAttendanceRecord.work_date,
            hours_logged: timeoutAttendanceRecord.hours_logged,
            work_setup: timeoutAttendanceRecord.work_setup,
        },
    };
}