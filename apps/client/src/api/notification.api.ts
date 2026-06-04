// MOCK FOR TESTING

import type {
    NotificationItem,
    NotificationsResponse,
} from '../../../shared/types/notification.types';

const MOCK_NOTIFICATIONS_KEY = 'mockNotifications';

const initialNotifications = [
    {
        id: '1',
        title: 'EOD Report Approved',
        message: 'Your EOD report for June 4, 2026 has been approved by your supervisor.',
        sent_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: '2',
        title: 'Leave Request Reviewed',
        message: 'Your leave request has been reviewed. Please check your leave request page for details.',
        sent_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: '3',
        title: 'Attendance Update',
        message: 'Your attendance record was updated by an admin. Please review your logs.',
        sent_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: '4',
        title: 'Profile Update Approved',
        message: 'Your profile update request has been approved.',
        sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_read: true,
    },
];

function getStoredNotifications() {
    const saved = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);

    if (!saved) {
        localStorage.setItem(
        MOCK_NOTIFICATIONS_KEY,
        JSON.stringify(initialNotifications)
        );

        return initialNotifications;
    }

    return JSON.parse(saved) as NotificationItem[];
}

function saveNotifications(notifications: NotificationItem[]) {
    localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export async function getNotificationsAPI(): Promise<NotificationsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
        message: 'Notifications fetched successfully',
        data: getStoredNotifications(),
    };
}

export async function markNotificationAsReadAPI(
    notificationId: string
    ): Promise<NotificationsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const updatedNotifications = getStoredNotifications().map((notification) =>
        notification.id === notificationId
        ? {
            ...notification,
            is_read: true,
            }
        : notification
    );

    saveNotifications(updatedNotifications);

    return {
        message: 'Notification marked as read',
        data: updatedNotifications,
    };
}