import { supabase } from '../config/supabase.ts';
import { getAuthUserId } from '../utils/auth.util.ts';
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

export async function fetchLeaveRequestById(
    record_id: string
) {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch a record.`);
    }

    const { data: fetchData, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('record_id', record_id)
        .single();

    if (fetchError) {
        console.error('Error fetching record:', fetchError.message);
        throw fetchError;
    }

    return fetchData
}

export const fetchAllLeaveRequestDatesOfIntern = async (): Promise<
    { start_date: string; end_date: string }[]
> => {
    const intern_id = await getAuthUserId();

    if (!intern_id) {
        throw new Error(`You must be logged in to fetch your leaves.`);
    }

    const { data: leaveDates, error: fetchError } = await supabase
        .from('leave_requests')
        .select(`
            start_date,
            end_date,
            records!inner (
                id,
                intern_id,
                status
            )
        `)
        .eq('records.intern_id', intern_id)
        .in('records.status', ['pending', 'approved']);

    if (fetchError) {
        throw new Error(fetchError.message);
    }

    return leaveDates || [];
};

export const insertLeaveRequest = async (formData: LeaveRequestForm) => {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to file a leave.`);
    }

    const record: RecordInsert = {
        intern_id: intern_id,
        log_category: 'leave_request',
        activity_description: formData.reason_category === 'sick_medical'
        ? 'Medical Leave'
        : 'Academic Leave',
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

    if (!intern_id) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .from('leave_requests')
        .select(`
            record_id,
            records!inner (
                id,
                intern_id,
                status
            )
        `)
        .eq('records.intern_id', intern_id)
        .in('records.status', ['pending', 'approved'])
        .lte('start_date', endDate)
        .gte('end_date', startDate);

    if (error) {
        console.log(error);
        throw new Error(error.message);
    }

    return (data?.length ?? 0) > 0;
};