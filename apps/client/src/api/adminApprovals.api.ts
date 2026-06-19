import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth';
import { useQuery } from '@tanstack/react-query';

export function usefetchPendingRequestsPerRecord() {
    return useQuery({
        queryKey: ['pendingRequests'],
        queryFn: fetchPendingRequestsPerRecord,
        refetchOnWindowFocus: true, 
    });
};

export async function fetchPendingRequestsPerRecord(): Promise<Record<string, number>> {
    const admin_id = await getAuthUserId();
    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!await isAdmin()) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data, error:fetchError } = await supabase
        .from('records')
        .select('log_category')
        .eq('status', 'pending')
        .not('log_category', 'eq', 'attendance');

    if (fetchError) {
        throw new Error(`Error fetching pending counts: ${fetchError.message}`);
    }

    const counts = (data || []).reduce((acc, curr) => {
        const type = curr.log_category;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return counts;
}