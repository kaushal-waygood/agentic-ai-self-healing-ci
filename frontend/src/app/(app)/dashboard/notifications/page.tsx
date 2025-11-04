/** @format */
'use client';

import { useNotifications } from '@/hooks/notifications/useNoifications';
import { Loader2, RefreshCcw, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    fetchUnreadCount,
    connectionStatus,
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // This useEffect fetches data when the page loads
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchNotifications();
      await fetchUnreadCount();
      setIsLoading(false);
    };

    loadInitialData();
    // We only want this to run once on mount, so we leave the dependency array empty.
    // fetchNotifications and fetchUnreadCount are stable from useNotifications hook.
  }, [fetchNotifications, fetchUnreadCount]); // Add dependencies

  // This handler is for the manual refresh button
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchNotifications();
    await fetchUnreadCount();
    setIsLoading(false);
  };

  // This handler processes a click on a single notification
  const handleNotificationClick = (notification) => {
    // Mark as read *if* it's currently unread
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    // Navigate to the relevant page
    router.push(`/dashboard/my-docs/${notification.actionUrl}`);
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
  }

  // --- Render Main Content ---
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">
          All Notifications ({notifications.length})
        </h2>
        <div className="flex items-center space-x-4">
          <span
            className={`text-xs font-medium ${
              connectionStatus === 'connected'
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            Status: {connectionStatus}
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            title="Refresh"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border rounded-lg shadow-sm transition hover:shadow-md cursor-pointer ${
                notification.isRead
                  ? 'bg-white text-gray-700 border-gray-200'
                  : 'bg-blue-50 text-gray-900 border-blue-200 font-medium'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <strong className="text-base">{notification.title}</strong>
                {!notification.isRead && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm mb-1">{notification.message}</p>
              <small className="text-gray-400 text-xs">
                {new Date(notification.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          // --- Render Empty State ---
          <div className="text-center p-10 border-2 border-dashed rounded-lg">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">
              You're all caught up!
            </h3>
            <p className="text-sm text-gray-500">
              You have no new notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
