'use client';

import { useNotifications } from '@/hooks/notifications/useNoifications';
import { RefreshCcw } from 'lucide-react';
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
    console.log('🔔 Frontend Connection Status:', connectionStatus);
    console.log('🔔 Current notifications:', notifications);
    console.log('🔔 Unread count:', unreadCount);
    console.log('🔔 Socket instance:', socket ? 'Exists' : 'Null');
  }, [connectionStatus, notifications, unreadCount, socket]);

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
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="p-4 ">
      <div
        className="connection-status"
        style={{
          color: connectionStatus === 'connected' ? 'green' : 'red',
          fontSize: '12px',
        }}
      >
        Status: {connectionStatus}
      </div>

      <div>
        <RefreshCcw
          className="h-5 w-5 cursor-pointer"
          onClick={fetchNotifications}
        />
      </div>

      <div className="bell-icon">
        🔔
        {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
      </div>

      <div className="">
        {notifications.slice(0, 5).map((notification) => (
          <div
            key={notification._id}
            className={`p-2 border mb-2 rounded ${
              notification.isRead ? 'read' : 'unread'
            }`}
            onClick={() => !notification.isRead && markAsRead(notification._id)}
          >
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
            <small>
              {new Date(notification.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
