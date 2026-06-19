import { Bell, ChevronsDown, X } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchInternNotificationsAPI,
  updateInternNotificationsAsRead
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

function NotificationCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [, setCurrentTime] = useState(Date.now());

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchInternNotificationsAPI,
  });

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: updateInternNotificationsAsRead,
    onSuccess: async () => { await refetch(); },
  });

  useEffect(() => {
    const timer = window.setInterval(() => { setCurrentTime(Date.now()); }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleReadMore = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) markAsReadMutation.mutate(notification.id);
  };

  const handleCloseModal = () => setSelectedNotification(null);

  return (
    <>
      <section className="relative w-full rounded-xl bg-white shadow-md">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
        >
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold sm:text-xl xl:text-2xl">Notification</h2>
            {unreadCount > 0 && (
              <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#FFBF10] text-xs sm:text-sm font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <ChevronsDown size={22} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 w-full max-h-[390px] space-y-3 overflow-y-auto rounded-b-xl bg-white p-4 shadow-xl border-x border-b border-gray-100">
            {isLoading && <p className="py-2 text-sm text-gray-500 text-center">Loading notifications...</p>}
            {!isLoading && notifications.length === 0 && (
              <p className="py-2 text-sm text-gray-500 text-center">No notifications yet.</p>
            )}

            {!isLoading &&
              notifications.map((notification) => (
                <div
                  key={notification.record_id}
                  className="relative flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition-colors hover:bg-gray-50/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFDB4A]/50 mt-0.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFBF10] text-white">
                      <Bell size={13} fill="white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-x-2 gap-y-0.5 pr-4">
                      <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                        {notification.title}
                      </h3>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {getElapsedTime(notification.sent_at)}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs sm:text-sm text-gray-500">
                      {notification.message}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleReadMore(notification)}
                      className="mt-2 text-xs sm:text-sm font-bold text-[#0058DD] hover:underline block"
                    >
                      Read more
                    </button>
                  </div>

                  {!notification.is_read && (
                    <span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-red-600" />
                  )}
                </div>
              ))}
          </div>
        )}
      </section>

      {selectedNotification && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={handleCloseModal} />
          
          <div className="relative w-full max-w-[540px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between bg-[#002D6F] px-5 py-4 sm:px-6 sm:py-5 text-white">
              <div className="min-w-0 pr-4">
                <h3 className="text-xl font-bold sm:text-2xl truncate">
                  {selectedNotification.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/75">
                  {getElapsedTime(selectedNotification.sent_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-1.5 transition hover:bg-white/10 shrink-0"
                aria-label="Close notification"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-line">
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