export type Notification = {
    id: string;
    record_id: string;
    intern_id: string;
    admin_id: string;
    title: string;
    message: string;
    status: string;
    sent_at: string;
    is_read: boolean;
};

export type NotificationsResponse = {
    message: string;
    data: Notification[];
};