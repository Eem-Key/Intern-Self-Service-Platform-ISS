export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
};

export type NotificationsResponse = {
    message: string;
    data: NotificationItem[];
};