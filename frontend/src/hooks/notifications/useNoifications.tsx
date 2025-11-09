/** @format */
// hooks/useNotifications.js (frontend)
import apiInstance from '@/services/api';
import { useEffect, useState, useCallback } from 'react'; // <-- Import useCallback
import { io } from 'socket.io-client';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // --- Socket Connection Effect ---
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

    newSocket.onAny((event, ...args) => {
      console.log('🔔 📡 Socket event:', event, args);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔔 🧹 Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []); // This runs once on mount to set up the socket

  // --- Data Fetching Functions (Wrapped in useCallback) ---

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
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
  }, []); // Empty array means this function is stable

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiInstance.get('/notifications/unread-count');
      const data = response.data;
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []); // Empty array means this function is stable

  const markAsRead = useCallback(
    async (notificationId) => {
      if (socket) {
        socket.emit('mark-as-read', { notificationId });
      }
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [socket],
  ); // Depends on socket state

  // --- NEW: Initial Data Fetch Effect ---
  // This hook runs once when the component mounts
  // and fetches the initial data.
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications(); // Fetches the first page of notifications
  }, [fetchUnreadCount, fetchNotifications]); // Depends on the stable useCallback functions

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
