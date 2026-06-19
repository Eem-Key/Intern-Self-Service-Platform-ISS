import type { ReportStatus } from './enums.types'

export type Notification = {
    id: string;
    record_id: string;
    intern_id: string;
    admin_id?: string | null;
    title: string;
    message: string;
    status: ReportStatus | null;
    sent_at: string;
    is_read?: boolean;
};

export type NotificationInsert = Omit<Notification, 'id' | 'sent_at'>

export type NotificationsResponse = {
    message: string;
    data: Notification[];
};