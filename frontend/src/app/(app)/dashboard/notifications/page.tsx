/** @format */

'use client';

import { Loader } from '@/components/Loader';
import { useNotifications } from '@/hooks/notifications/useNoifications';
import { RefreshCcw, Bell, Sparkles, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchNotifications();
      await fetchUnreadCount();
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    await fetchUnreadCount();
    setIsRefreshing(false);
  };

  // const handleNotificationClick = (notification) => {
  //   if (!notification.isRead) {
  //     markAsRead(notification._id);
  //   }
  //   router.push(`${notification.actionUrl}`);
  // };
  const handleNotificationClick = (notification) => {
    let url = notification.actionUrl;
    if (url) {
      if (notification.category === 'feature') {
        url = '/dashboard/request-new-feature';
      }
      router.push(url.startsWith('/') ? url : `/dashboard/${url}`);
    }
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    // router.push(`${notification.actionUrl}`);
  };

  if (isLoading) {
    return (
      <Loader
        message="Loading notifications..."
        classStyle="min-h-screen -mt-16"
      />
    );
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200/50">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {notifications.length}{' '}
                  {notifications.length === 1
                    ? 'notification'
                    : 'notifications'}
                  {unreadCount > 0 && (
                    <span className="ml-2 font-semibold text-blue-600">
                      • {unreadCount} unread
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-slate-100 flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  } animate-pulse`}
                ></div>
                <span className="text-xs font-medium text-slate-700 capitalize">
                  {connectionStatus}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  isRefreshing
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Refresh"
              >
                <RefreshCcw
                  className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div
                key={notification._id}
                onMouseEnter={() => setHoveredId(notification._id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-102 ${
                  notification.isRead
                    ? 'bg-white border-slate-200/50 hover:border-slate-300 shadow-sm hover:shadow-md'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 hover:border-blue-300 shadow-md hover:shadow-lg'
                }`}
                style={{
                  animation: `slideIn 0.4s ease-out ${index * 0.05}s both`,
                }}
              >
                {/* Animated background gradient */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    notification.isRead
                      ? 'bg-gradient-to-r from-slate-50 to-slate-100'
                      : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                  }`}
                />

                <div className="relative p-5 md:p-6">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        notification.isRead
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-blue-100 text-blue-600 group-hover:scale-110'
                      }`}
                    >
                      {notification.isRead ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Sparkles className="w-6 h-6" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3
                          className={`text-base font-semibold transition-colors duration-200 ${
                            notification.isRead
                              ? 'text-slate-900'
                              : 'text-slate-900'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            New
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm leading-relaxed transition-colors duration-200 ${
                          notification.isRead
                            ? 'text-slate-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {notification.message}
                      </p>

                      <p className="text-xs text-slate-400 mt-3">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Hover indicator */}
                    <div
                      className={`flex-shrink-0 w-1 h-full rounded-full transition-all duration-300 ${
                        hoveredId === notification._id
                          ? notification.isRead
                            ? 'bg-slate-300'
                            : 'bg-gradient-to-b from-blue-400 to-indigo-500'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-12 md:p-16">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <Bell className="w-10 h-10 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  You're all caught up!
                </h3>
                <p className="text-slate-600 max-w-sm mx-auto">
                  No new notifications right now. We'll let you know when
                  something important happens.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
