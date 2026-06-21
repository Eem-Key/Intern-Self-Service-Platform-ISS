import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    fetchAdminNotificationsAPI,
    updateAdminNotificationsAsRead,
} from '../../../../api/notification.api';
import type { Notification } from '../../../../../../shared/types/notification.types';

function getElapsedTime(sentAt: string) {
    const sentTime = new Date(sentAt).getTime();
    const now = Date.now();

    const diffInSeconds = Math.floor((now - sentTime) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes === 1) return '1 min ago';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';

    return `${diffInDays} days ago`;
}

function isNotificationUnread(notification: Notification) {
    const item = notification as Notification & {
        is_read?: boolean | null;
        isRead?: boolean | null;
        read_at?: string | null;
        readAt?: string | null;
    };

    if (typeof item.is_read === 'boolean') return !item.is_read;
    if (typeof item.isRead === 'boolean') return !item.isRead;

    if ('read_at' in item) return !item.read_at;
    if ('readAt' in item) return !item.readAt;

    return false;
}

function NotificationCard() {
    const [selectedNotification, setSelectedNotification] =
        useState<Notification | null>(null);
    const [, setCurrentTime] = useState(Date.now());

    const { data, refetch, isLoading } = useQuery({
        queryKey: ['admin-notifications'],
        queryFn: fetchAdminNotificationsAPI,
    });

    const notifications = data?.data ?? [];
    const unreadCount = notifications.filter(isNotificationUnread).length;

    const markAsReadMutation = useMutation({
        mutationFn: updateAdminNotificationsAsRead,
        onSuccess: async () => {
        await refetch();
        },
    });

    useEffect(() => {
        const timer = window.setInterval(() => {
        setCurrentTime(Date.now());
        }, 60_000);

        return () => window.clearInterval(timer);
    }, []);

    const handleReadMore = (notification: Notification) => {
        setSelectedNotification(notification);

        if (isNotificationUnread(notification)) {
        markAsReadMutation.mutate(notification.id);
        }
    };

    const handleCloseModal = () => {
        setSelectedNotification(null);
    };

    return (
        <>
        <section className="flex h-[calc(100vh-280px)] min-h-[360px] max-h-[520px] min-w-0 flex-col rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
        {/*<section className="flex min-w-0 flex-col rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">*/}
            <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
                <h2 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold sm:text-2xl">
                Notification
                </h2>

                {unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FFBF10] px-2 text-xs font-bold text-white sm:h-7 sm:min-w-7 sm:text-sm">
                    {unreadCount}
                </span>
                )}
            </div>
            </div>
            
            
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {/*<div className="max-h-[320px] space-y-3 overflow-y-auto pr-1 sm:max-h-[380px] md:max-h-[420px] lg:max-h-[calc(100vh-360px)] xl:max-h-[calc(100vh-280px)]">*/}
            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                        <p className="text-sm font-medium text-gray-500">
                        Loading notifications...
                        </p>
                </div>
            )}

            {!isLoading && notifications.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                No notifications yet.
                </p>
            )}

            {!isLoading &&
                notifications.map((notification) => {
                const isUnread = isNotificationUnread(notification);

                return (
                    <div
                    key={notification.id}
                    className={`relative flex w-full items-start gap-3 rounded-xl border p-3 text-left shadow-sm transition-colors ${
                        isUnread
                        ? 'border-[#FFBF10]/40 bg-[#FFFDF4]'
                        : 'border-gray-100 bg-white hover:bg-gray-50/50'
                    }`}
                    >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFDB4A]/50">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFBF10] text-white">
                        <Bell size={13} fill="white" />
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-x-2 gap-y-0.5 pr-4 sm:flex-row sm:items-baseline">
                        <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                            {getNotificationName(notification)}
                        </h3>

                        <span className="shrink-0 text-[11px] text-gray-400">
                            {getElapsedTime(notification.sent_at)}
                        </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                        {notification.message}
                        </p>

                        <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleReadMore(notification)}
                            className="text-[11px] font-bold text-[#0058DD] hover:underline"
                        >
                            Read more
                        </button>
                        </div>
                    </div>

                    {isUnread && (
                        <span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-red-600" />
                    )}
                    </div>
                );
                })}
            </div>
        </section>

        {selectedNotification && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm lg:left-[270px]">
            <div className="fixed inset-0" onClick={handleCloseModal} />

            <div className="relative w-full max-w-[540px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between bg-[#002D6F] px-5 py-4 text-white sm:px-6 sm:py-5">
                <div className="min-w-0 pr-4">
                    <h3 className="truncate text-xl font-bold sm:text-2xl">
                        {getNotificationName(selectedNotification)}
                    </h3>

                    <p className="mt-1 text-xs text-white/75 sm:text-sm">
                    {getElapsedTime(selectedNotification.sent_at)}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCloseModal}
                    className="shrink-0 rounded-full p-1.5 transition hover:bg-white/10"
                    aria-label="Close notification"
                >
                    <X size={20} />
                </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 sm:text-base">
                    {selectedNotification.message}
                </p>
                </div>
            </div>
            </div>
        )}
        </>
    );
}

type NotificationWithName = Notification & {
  Name?: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    suffix?: string | null;
  } | null;
};

function getNotificationName(notification: Notification) {
    const item = notification as NotificationWithName;

    if (!item.Name) return notification.title || '--';

    const middleInitial = item.Name.middle_name
        ? `${item.Name.middle_name.charAt(0).toUpperCase()}.`
        : null;

    const fullName = [
        item.Name.first_name,
        middleInitial,
        item.Name.last_name,
        item.Name.suffix,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return fullName || notification.title || '--';
}

export default NotificationCard;