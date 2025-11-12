/** @format */
// hooks/useNotifications.js (frontend)
import apiInstance from '@/services/api';
import { useEffect, useState, useCallback, useRef } from 'react'; // <-- Import useCallback
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/services/api';

export function useNotifications() {
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const backendUrl = API_BASE_URL || 'http://127.0.0.1:8080';
    console.log('🔔 Attempting to connect to:', backendUrl);

    // Avoid re-creating socket in dev strict mode / HMR
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔔 Reusing existing socket instance');
      return;
    }

    const token = localStorage.getItem('accessToken') || '';

    const opts = {
      path: '/socket.io', // be explicit; must match server
      transports: ['websocket'], // avoid polling noise in dev
      autoConnect: false, // prevents instant connect on mount
      withCredentials: true,
      auth: { token: `Bearer ${token}` }, // server strips 'Bearer ' — be explicit
    };

    const sock = io(`${backendUrl}/notifications`, opts);
    socketRef.current = sock;
    setSocket(sock);

    const onConnect = () => {
      console.log('🔔 ✅ Connected, id:', sock.id);
      setConnectionStatus('connected');
    };
    const onConnectError = (err) => {
      console.error(
        '🔔 ❌ Connection error:',
        err && err.message ? err.message : err,
      );
      setConnectionStatus('error');
    };
    const onDisconnect = (reason) => {
      console.log('🔔 🔌 Disconnected:', reason);
      setConnectionStatus('disconnected');
    };

    sock.on('connect', onConnect);
    sock.on('connect_error', onConnectError);
    sock.on('disconnect', onDisconnect);

    sock.on('new-notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((p) => p + 1);
    });

    // keep a global ref for quick debug in console
    window.__notifSocket = sock;

    // now actually connect once wired
    sock.connect();

    return () => {
      console.log('🔔 🧹 Cleaning up socket connection');
      try {
        sock.off('connect', onConnect);
        sock.off('connect_error', onConnectError);
        sock.off('disconnect', onDisconnect);
        sock.disconnect();
      } catch (e) {
        console.warn('🔔 cleanup error', e);
      }
      socketRef.current = null;
      setSocket(null);
    };
  }, []); // run once

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

  function connectSocket(token) {
    // connect to namespace explicitly and pass auth token
    const socket = io(`${API_BASE_URL}/notifications`, {
      // or io(API_BASE_URL + '/notifications', { ... })
      auth: {
        token: `Bearer ${token}`, // server strips 'Bearer ' — you do that on server
      },
      transports: ['websocket'], // helps avoid polling in some dev setups
      path: '/socket.io', // default, but make explicit if custom server config
      // autoConnect: false, // if you want manual control
    });

    socket.on('connect', () => {
      console.log('🔔 ✅ connected to notifications', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('🔔 ❌ Connection error:', err.message);
    });

    return socket;
  }

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
