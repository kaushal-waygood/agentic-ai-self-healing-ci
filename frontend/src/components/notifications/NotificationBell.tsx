// components/notifications/NotificationBell.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Bell as BellIcon, Circle, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/notifications/useNoifications';
import Image from 'next/image';
import { Loader } from '../Loader';

export function NotificationBell() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    fetchUnreadCount,
    connectionStatus,
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        await fetchNotifications();
        await fetchUnreadCount();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fetchNotifications, fetchUnreadCount]);

  const handleClick = (n) => {
    if (n.actionUrl)
      router.push(
        n.actionUrl.startsWith('/') ? n.actionUrl : `/dashboard/${n.actionUrl}`,
      );
    if (!n.isRead) markAsRead(n._id);
  };

  if (isLoading) {
    return (
      <Loader
        message="Loading Notifications..."
        fullHeight={true}
        imageClassName="w-6 h-6"
        textClassName="text-sm"
      />
    );
  }

  return (
    <div className="p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <BellIcon className="w-6 h-6 cursor-pointer" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="text-sm">{connectionStatus}</div>
        <RefreshCcw
          className="w-5 h-5 cursor-pointer"
          onClick={() => fetchNotifications()}
        />
      </div>

      <div className="space-y-3">
        {notifications.slice(0, 5).map((n) => (
          <div
            key={n._id}
            onClick={() => handleClick(n)}
            className={`p-3 rounded-lg border transition cursor-pointer ${
              n.isRead
                ? 'bg-white border-gray-100'
                : 'bg-blue-50 border-blue-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <strong className="truncate">{n.title}</strong>
              <small className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </small>
            </div>
            <p className="text-sm mt-1 truncate">{n.message}</p>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center text-sm text-gray-500 p-4">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}
