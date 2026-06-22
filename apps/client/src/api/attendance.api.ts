import { supabase } from '../config/supabase';
import { getAuthUserId } from '../utils/auth.util';
import type { WorkSetup } from '../../../shared/types/enums.types';
import type {
    AttendanceRecord,
    TimeInResponse,
    TimeOutResponse
} from '../../../shared/types/attendance.types';
import type {
    Record,
    RecordInsert,
} from '../../../shared/types/record.types';
import { 
    insertRecord,
    updateRecord
} from './record.api'

export async function fetchAttendanceById(
    record_id: string
) {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch a record.`);
    }

    const { data: fetchData, error: fetchError } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('record_id', record_id)
        .single();

    if (fetchError) {
        console.error('Error fetching record:', fetchError.message);
        throw fetchError;
    }
    
    return fetchData
}

export async function fetchAttendanceByDateAPI(
    date: string
): Promise<AttendanceRecord | null> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch a record.`);
    }

    const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
            *,
            records!inner(id)
            `)
        .eq('records.intern_id', intern_id)
        .eq('records.log_category', 'attendance')
        .eq('records.date_created', date)
        .single();
    
    if (error) throw error;
    if (!data) return null;
    
    const { records, ...attendance } = data;
    
    return attendance as AttendanceRecord;
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
        .select('record_id')
        .eq('intern_id', intern_id)
        .is('clock_out', null)
        .maybeSingle();

    if (checkError) throw checkError;

    if (existingLog) {
        throw new Error('You have an active session. Please clock out of your current log before starting a new one.');
    }

    const record: RecordInsert = {
        intern_id: intern_id,
        log_category: 'attendance',
        activity_description: 'Time In',
        status: null
    }

    const record_id = await insertRecord(record);

    const { data: timein, error: insertError } = await supabase
        .from('attendance_logs')
        .insert([
            {
                record_id: record_id,
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

    return {
        message: 'Time in successful',
        data: {
            record_id: timein.id,
            clock_in: timein.clock_in,
            clock_out: null,
            work_date: timein.work_date,
            hours_logged: null,
            work_setup: timein.work_setup,
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
        .eq('record_id', attendanceId)
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

    await updateRecord(attendanceId, 'Time Out');

    const { data: timeout, error: updateError } = await supabase
        .from('attendance_logs')
        .update({
            clock_out: now.toISOString(),
            hours_logged: hours_logged,
        })
        .eq('record_id', attendanceId)
        .is('clock_out', null)
        .select()
        .single()

    if (updateError) {
        throw new Error(`Failed to clock out: ${updateError.message}`);
    }

    return {
        message: 'Time out successful',
        data: timeout,
    };
}
