import { supabase } from '../config/supabase.ts';
import { getAuthUserId } from '../utils/auth.ts';
import type {
    NotificationsResponse,
} from '../../../shared/types/notification.types';

export async function fetchNotificationsAPI(): Promise<NotificationsResponse> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch notifications.`);
    }

    const { data: fetchData, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('intern_id', intern_id)
        .in('status', ['approved', 'denied']);

    if (fetchError) {
        console.error('Error fetching notifications:', fetchError.message);
        throw fetchError;
    }

    return {
        message: 'Notifications fetched successfully',
        data: fetchData
    };
}

export async function updateNotificationsAsRead(id: string){
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to read a notification.`);
    }

    const { error: updateError } = await supabase
        .from('notifications')
        .update({
            is_read: true,
        })
        .eq('id', id)
        .in('status', ['approved', 'denied']);

    if (updateError) {
        console.error('Error updating notification:', updateError.message);
        throw updateError;
    }

}