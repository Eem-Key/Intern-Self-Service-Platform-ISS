import { supabase } from '../config/supabase.ts';
import { getAuthUserId } from '../utils/auth.util.ts';

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