import { supabase } from '../config/supabase.ts';
import { getAuthUserId, isAdmin } from '../utils/auth.util.ts';
import type { Record } from '../../../shared/types/record.types.ts';
import type {
    NotificationInsert,
    NotificationsResponse,
} from '../../../shared/types/notification.types';
import { fetchFullNameAPI } from './profile.api'

export async function fetchInternNotificationsAPI(): Promise<NotificationsResponse> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch notifications.`);
    }

    const { data: fetchData, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('intern_id', intern_id)
        .in('status', ['approved', 'denied'])
        .order('sent_at', { ascending: false });

    if (fetchError) {
        console.error('Error fetching notifications:', fetchError.message);
        throw fetchError;
    }

    return {
        message: 'Notifications fetched successfully',
        data: fetchData
    };
}

export async function fetchAdminNotificationsAPI(): Promise<NotificationsResponse> {
    const adminId = await getAuthUserId();
    if (!adminId) {
        throw new Error('You must be logged in as a user.');
    }

    if (!await isAdmin()) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data: fetchData, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'pending')
        .order('sent_at', { ascending: false });

    if (fetchError) {
        console.error('Error fetching notifications:', fetchError.message);
        throw fetchError;
    }

    return {
        message: 'Notifications fetched successfully',
        data: fetchData
    };
}

export async function insertInternNotificationAPI(record: Record){
    const notification: NotificationInsert = {
        record_id: record.id,
        intern_id: record.intern_id,
        title: createInternTitle(record),
        message: await createInternMessage(record),
        status: record.status,
    }
    const { data: notificationInsert, error: insertError } = await supabase
    .from('notifications')
    .insert([notification])
    .select('id')
    .single();

    if (insertError){
        console.log(insertError)
        throw insertError;
    }

    console.log('Intern Insert Record: ', notificationInsert.id)
}


export async function insertAdminNotificationAPI(record: Record){
    const notification: NotificationInsert = {
        record_id: record.id,
        intern_id: record.intern_id,
        title: createAdminTitle(record),
        message: createAdminMessage(record),
        status: record.status,
    }
    const { data: notificationInsert, error: insertError } = await supabase
    .from('notifications')
    .insert([notification])
    .select('id')
    .single();

    if (insertError){
        console.log(insertError)
        throw insertError;
    }

    console.log('Intern Admin Record: ', notificationInsert.id)
}

export async function updateInternNotificationsAsRead(id: string){
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
        .neq('is_read', true)
        .in('status', ['approved', 'denied']);

    if (updateError) {
        console.error('Error updating notification:', updateError.message);
        throw updateError;
    }

}


export async function updateAdminNotificationsAsRead(id: string){
    const adminId = await getAuthUserId();
    if (!adminId) {
        throw new Error('You must be logged in as a user.');
    }

    if (!await isAdmin()) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { error: updateError } = await supabase
        .from('notifications')
        .update({
            is_read: true,
        })
        .eq('id', id)
        .neq('is_read', true)
        .eq('status', 'pending');

    if (updateError) {
        console.error('Error updating notification:', updateError.message);
        throw updateError;
    }

}

function createInternTitle(record: Record): string{
    const recordstr = record.log_category?.toString().toUpperCase().replace(/_/g, ' ');

    const title = `${recordstr || 'REPORT or REQUEST'} is pending for review`;
    return title
}

function createAdminTitle(record: Record): string{
    const recordstr = record.log_category?.toString().toUpperCase().replace(/_/g, ' ');
    
    const title = `${recordstr || 'Report or Request'} has been ${record.status?.toString().toUpperCase() || 'Reviewed'}`;
    return title
}

async function createInternMessage(record: Record): Promise<string> {
    const recordstr = record.log_category?.toString().toUpperCase().replace(/_/g, ' ');
    
    const conjunction = record.log_category === 'eod_report' ? 'an' : 'a';
    
    const fullName = await fetchFullNameAPI(record.intern_id).catch(() => 'Intern');
    
    const readableDate = formatDate(record.created_at);
    
    return `${fullName} submitted ${conjunction} ${recordstr || 'Report or Request'} on ${readableDate}.`;
}

function createAdminMessage(record: Record): string{
    if (record.reviewed_at){
        const recordstr = record.log_category?.toString().toUpperCase().replace(/_/g, ' ');
    
        const readableDate = formatDate(record.created_at);

        const message = `Your ${recordstr || 'Report or Request'} has been ${record.status?.toString().toUpperCase() || 'Reviewed'}  ${readableDate} by your supervisor.`;

        return message;
    }
    
    return 'No Admin Error'
}

function formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}