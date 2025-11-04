'use client';

import { useNotifications } from '@/hooks/notifications/useNoifications';
import { RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    fetchUnreadCount,
    socket,
    connectionStatus,
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchNotifications();
      await fetchUnreadCount();
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 text-gray-500 animate-pulse">
        Loading notifications...
      </div>
    );
  }

  const router = useRouter();

  const handleNotificationClick = (notification) => {
    router.push(`/dashboard/my-docs/${notification.actionUrl}`);
    console.log('Notification clicked:', notification);
    // !notification.isRead && markAsRead(notification._id);
  };

  return (
    <div className="p-4 w-full max-w-sm mx-auto">
      {/* Refresh Button */}

      {/* Bell Icon */}
      <div className="relative flex justify-between mb-4">
        <div className="relative text-xl cursor-pointer hover:scale-110 transition-transform">
          <BellIcon className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        {/* Connection Status */}
        <div
          className={`text-sm flex flex-wrap justify-between font-semibold  ${
            connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          Status: {connectionStatus}
        </div>
        <div className="flex justify-end ">
          <RefreshCcw
            className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700 transition"
            onClick={fetchNotifications}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.slice(0, 5).map((notification) => (
          <div
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 border rounded-lg shadow-sm transition hover:shadow-md cursor-pointer ${
              notification.isRead
                ? 'bg-white text-gray-700 border-gray-200'
                : 'bg-blue-50 text-gray-900 border-blue-200'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <strong>{notification.title}</strong>
              {/* {!notification.isRead && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  New
                </span>
              )} */}
            </div>
            <p className="text-sm mb-1">{notification.message}</p>
            <small className="text-gray-400 text-xs">
              {new Date(notification.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
