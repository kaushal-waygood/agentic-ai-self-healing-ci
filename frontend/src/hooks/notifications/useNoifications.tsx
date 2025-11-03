// hooks/useNotifications.js (frontend)
import apiInstance from '@/services/api';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // Add this

  useEffect(() => {
    const backendUrl = 'http://localhost:8080';

    console.log('🔔 Attempting to connect to:', backendUrl);

    const newSocket = io(`${backendUrl}/notifications`, {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log(
        '🔔 ✅ Connected to notification server, Socket ID:',
        newSocket.id,
      );
      setConnectionStatus('connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔔 ❌ Connection error:', error.message);
      setConnectionStatus('error');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔔 🔌 Disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    newSocket.on('new-notification', (notification) => {
      console.log('🔔 📨 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('notification-read', (data) => {
      console.log('🔔 ✅ Notification marked as read:', data);
    });

    // Add this to see all events
    newSocket.onAny((event, ...args) => {
      console.log('🔔 📡 Socket event:', event, args);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔔 🧹 Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []);

  const markAsRead = async (notificationId) => {
    if (socket) {
      socket.emit('mark-as-read', { notificationId });
    }
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const fetchNotifications = async (page = 1, limit = 20) => {
    try {
      const response = await apiInstance.get(
        `/notifications?page=${page}&limit=${limit}`,
      );
      const data = response.data;

      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiInstance.get('/notifications/unread-count');
      const data = response.data;

      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    fetchUnreadCount,
    socket,
    connectionStatus,
  };
}
