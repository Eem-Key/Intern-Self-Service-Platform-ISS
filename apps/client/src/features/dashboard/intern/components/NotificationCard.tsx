import { Bell, ChevronsDown, X } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  getNotificationsAPI,
  markNotificationAsReadAPI,
} from '../../../../api/notification.api';
import type { NotificationItem } from '../../../../../../shared/types/notification.types';

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

function NotificationCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [, setCurrentTime] = useState(Date.now());

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsAPI,
  });

  const notifications = data?.data ?? [];

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsReadAPI,
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

  const handleReadMore = (notification: NotificationItem) => {
    setSelectedNotification(notification);

    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  return (
    <>
      <section className="relative rounded-xl bg-white shadow-md">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold xl:text-2xl">Notification</h2>

            {unreadCount > 0 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFBF10] text-sm font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <ChevronsDown size={28} strokeWidth={3} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-40 mt-3 max-h-[390px] space-y-3 overflow-y-auto rounded-xl bg-white px-5 py-5 shadow-xl sm:px-6">
            {isLoading && (
              <p className="py-4 text-sm text-gray-500">
                Loading notifications...
              </p>
            )}

            {!isLoading && notifications.length === 0 && (
              <p className="py-4 text-sm text-gray-500">
                No notifications yet.
              </p>
            )}

            {!isLoading &&
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="relative flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFDB4A]/60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFBF10] text-white">
                      <Bell size={16} fill="white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="truncate text-base font-bold">
                        {notification.title}
                      </h3>

                      <span className="shrink-0 pr-5 text-sm text-gray-500">
                        {getElapsedTime(notification.sent_at)}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {notification.message}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleReadMore(notification)}
                      className="mt-2 text-sm font-semibold text-[#0058DD] hover:underline"
                    >
                      Read more
                    </button>
                  </div>

                  {!notification.is_read && (
                    <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-red-600" />
                  )}
                </div>
              ))}
          </div>
        )}
      </section>

      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-[#002D6F] px-6 py-5 text-white">
              <div>
                <h3 className="text-2xl font-bold">
                  {selectedNotification.title}
                </h3>

                <p className="mt-1 text-sm text-white/80">
                  {getElapsedTime(selectedNotification.sent_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-1 transition hover:bg-white/10"
                aria-label="Close notification"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-base leading-relaxed text-gray-700">
                {selectedNotification.message}
              </p>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationCard;