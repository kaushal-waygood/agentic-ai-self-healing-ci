// hooks/useNotifications.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import apiInstance, { API_BASE_URL } from '@/services/api';
import { getToken } from '../useToken';

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
};

type DocumentStatusUpdate = {
  documentId: string;
  documentType: 'cv' | 'cl' | 'application';
  status: string;
  updatedAt?: string;
  error?: string;
};

export function useNotifications() {
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false); // Add this state
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'error'
  >('disconnected');

  // Helper: safely update state
  const prependNotification = useCallback((n: Notification) => {
    setNotifications((prev) => [n, ...prev]);
    setUnreadCount((c) => c + (n.isRead ? 0 : 1));
  }, []);

  // Init socket once
  useEffect(() => {
    const backendUrl = API_BASE_URL || 'http://127.0.0.1:8080';
    const token = typeof window !== 'undefined' ? getToken() : '';

    // reuse socket if already connected (helps with HMR/StrictMode)
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const socket = io(`${backendUrl}/notifications`, {
      path: '/socket.io',
      transports: ['websocket'],
      autoConnect: false,
      auth: { token: token ? `Bearer ${token}` : '' },
    });

    socketRef.current = socket;

    const onConnect = () => setConnectionStatus('connected');
    const onError = (err: any) => {
      console.error('notification socket error', err);
      setConnectionStatus('error');
    };
    const onDisconnect = () => setConnectionStatus('disconnected');

    const onNew = (notification: Notification) => {
      prependNotification(notification);
    };
    const onDocumentStatusUpdated = (update: DocumentStatusUpdate) => {
      window.dispatchEvent(
        new CustomEvent('document-status-updated', {
          detail: update,
        }),
      );
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onError);
    socket.on('disconnect', onDisconnect);
    socket.on('new-notification', onNew);
    socket.on('document-status-updated', onDocumentStatusUpdated);

    // store globally for debug if you like
    // @ts-ignore
    window.__notifSocket = socket;

    socket.connect();

    return () => {
      // cleanup all listeners and disconnect
      try {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        socket.off('disconnect', onDisconnect);
        socket.off('new-notification', onNew);
        socket.off('document-status-updated', onDocumentStatusUpdated);
        socket.disconnect();
      } catch (e) {
        console.warn('useNotifications cleanup failed', e);
      }
      socketRef.current = null;
    };
  }, [prependNotification]);
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiInstance.get('/notifications/unread-count');
      if (res.data?.success) setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('fetchUnreadCount failed', err);
    }
  }, []);
  // --- API calls ---
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      setIsLoading(true);
      try {
        const res = await apiInstance.get(
          `/notifications?page=${page}&limit=${limit}`,
        );
        if (res.data?.success) {
          setNotifications(res.data.data.notifications || []);
          // fetchUnreadCount moved to initial useEffect to avoid duplicate API calls
        }
      } catch (err) {
        console.error('fetchNotifications failed', err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    // optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    // send to server (socket if connected, else fall back to HTTP)
    const socket = socketRef.current;
    try {
      if (socket && socket.connected) {
        socket.emit('mark-as-read', { notificationId });
      } else {
        await apiInstance.post(`/notifications/${notificationId}/mark-as-read`);
      }
    } catch (err) {
      console.error('markAsRead failed', err);
      // optionally refetch to reconcile
    }
  }, []);

  // const markAllAsRead = useCallback(async () => {
  //   setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  //   setUnreadCount(0);
  //   try {
  //     if (socketRef.current && socketRef.current.connected) {
  //       socketRef.current.emit('mark-all-as-read');
  //     } else {
  //       await apiInstance.post('/notifications/mark-all-as-read');
  //     }
  //   } catch (err) {
  //     console.error('markAllAsRead failed', err);
  //   }
  // }, []);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    setNotifications((prev) =>
      prev.map((n) => (n.isRead ? n : { ...n, isRead: true })),
    );
    setUnreadCount(0);

    try {
      await apiInstance.patch('/notifications/mark-all-read');
    } catch (err) {
      console.error('markAllAsRead failed', err);
    }
  }, [unreadCount]);

  // initial fetch once - run both in parallel (fetchNotifications no longer calls fetchUnreadCount to avoid 2x)
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, [fetchNotifications, fetchUnreadCount]);

  // Listen for document generation complete - refresh notifications immediately
  useEffect(() => {
    const onDocComplete = () => {
      fetchNotifications();
      fetchUnreadCount();
    };
    window.addEventListener('document-generation-complete', onDocComplete);
    return () =>
      window.removeEventListener('document-generation-complete', onDocComplete);
  }, [fetchNotifications, fetchUnreadCount]);

  // Polling fallback when socket disconnected - ensures notifications appear within ~15s
  useEffect(() => {
    if (connectionStatus !== 'disconnected') return;
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 15000);
    return () => clearInterval(interval);
  }, [connectionStatus, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    isLoading,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount,
    socket: socketRef.current,
    connectionStatus,
  };
}
