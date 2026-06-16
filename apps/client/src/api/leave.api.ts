import { supabase } from '../config/supabase.ts';
import { getAuthUserId } from '../utils/auth.ts';
import type { LeaveReason } from '../../../shared/types/enums.types.ts';
import type { 
    LeaveRequest, 
    LeaveRequestForm 
} from '../../../shared/types/leave.types.ts';
import type {
    Record,
    RecordInsert,
} from '../../../shared/types/record.types';
import { 
    insertRecord 
} from './record.api'

export const fetchAllLeaveRequestDatesOfIntern = async (

): Promise<{ start_date: string; end_date: string }[]> => {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch your leaves.`);
    }

    const { data: leaveDates, error: fetchError } = await supabase
        .from('leave_requests')
        .select(`
            start_date, 
            end_date,   
            records (
            id,
            intern_id,
            status
            )
        `) 
        .eq('records.intern_id', intern_id)
        .neq('records.status', 'denied'); 

    if (fetchError) {
        throw new Error(fetchError.message);
    }

    return leaveDates || [];
}

export const insertLeaveRequest = async (formData: LeaveRequestForm) => {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to file a leave.`);
    }

    const record: RecordInsert = {
        intern_id: intern_id,
        log_category: 'leave_request',
        status: 'pending'
    }

    const record_id = await insertRecord(record);

    const leaveRequest: LeaveRequest = {
            record_id: record_id,
            
            reason_category: formData.reason_category as LeaveReason,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
        };

    const { data: newLeaveData, error: insertError } = await supabase
        .from('leave_requests')
        .insert([leaveRequest]) 
        .select()
        .single();

    if (insertError) {
        throw new Error(insertError.message);
    }

    return newLeaveData;
};

export const checkLeaveRequestDates = async (
    startDate: string, 
    endDate: string
): Promise<boolean> => {
    const intern_id = await getAuthUserId();
    if (!intern_id) throw new Error("Not authenticated");

    const { data, error} = await supabase
        .from('leave_requests')
        .select(`
            record_id, 
            records (
            id,
            intern_id,
            status
            )
        `)
        .eq('records.intern_id', intern_id)
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .neq('records. status', 'denied');

    if (error) {
        console.log(error)
        throw new Error(error.message);
    }

    return (data?.length ?? 0) > 0;
};