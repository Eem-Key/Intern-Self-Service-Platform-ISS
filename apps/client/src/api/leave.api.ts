import { supabase } from '../config/supabase.ts';
import { getAuthUserId } from '../utils/auth.ts';
import type { LeaveForm, LeaveRequestInsert } from '../../../shared/types/leave.types.ts';

export const fetchAllLeaveRequestDatesOfIntern = async (

): Promise<{ start_date: string; end_date: string }[]> => {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch your leaves.`);
    }

    const { data: leaveDates, error: fetchError } = await supabase
        .from('leave_requests')
        .select('start_date, end_date') 
        .eq('intern_id', intern_id)
        .neq('status', 'rejected'); 

    if (fetchError) {
        throw new Error(fetchError.message);
    }

    return leaveDates || [];
}

export const insertLeaveRequest = async (formData: LeaveForm) => {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to file a leave.`);
    }

    const leaveRequest: LeaveRequestInsert = {
            intern_id: intern_id,
            
            reason_category: formData.reason_category,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,

            status: 'pending',
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

export const checkLeaveRequest = async (
    startDate: string, 
    endDate: string
): Promise<boolean> => {
    const intern_id = await getAuthUserId();
    if (!intern_id) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from('leave_requests')
        .select('id')
        .eq('intern_id', intern_id)
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .neq('status', 'denied');

    if (error) throw new Error(error.message);

    return (data?.length ?? 0) > 0;
};