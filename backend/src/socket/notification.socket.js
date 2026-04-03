import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export function setupNotificationSocket(io) {
  const notificationNamespace = io.of('/notifications');

  notificationNamespace.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        console.log('🔔 ❌ No token provided');
        return next(new Error('Authentication token required'));
      }

      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, config.accessTokenSecret);

      socket.user = {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      };

      console.log(`🔔 ✅ User ${socket.user._id} authenticated`);
      next();
    } catch (error) {
      console.error('🔔 ❌ Socket authentication error:', error.message);
      next(new Error('Invalid authentication token'));
    }
  });

  notificationNamespace.on('connection', (socket) => {
    console.log(
      `🔔 ✅ User ${socket.user._id} connected to notifications, Socket ID: ${socket.id}`,
    );

    // Join user to their personal room
    const userRoom = `user:${socket.user._id}`;
    socket.join(userRoom);

    console.log(`🔔 🏠 User ${socket.user._id} joined room: ${userRoom}`);

    // Log all rooms this socket is in
    console.log(`🔔 🏠 Socket ${socket.id} rooms:`, socket.rooms);

    // Test: Send a welcome notification immediately
    /* This has been removed as requested. Users will no longer get a 
    dummy welcome notification on connection.
    
    socket.emit('new-notification', {
      _id: 'welcome',
      title: 'Welcome!',
      message: 'Notifications are working!',
      type: 'success',
      isRead: false,
      createdAt: new Date(),
    });
    */

    socket.on('mark-as-read', async (data) => {
      try {
        const { markAsRead } = await import(
          '../services/notification.service.js'
        );
        await markAsRead(data.notificationId, socket.user._id);
        socket.emit('notification-read', {
          success: true,
          notificationId: data.notificationId,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔔 🔌 User ${socket.user._id} disconnected: ${reason}`);
    });
  });

  return notificationNamespace;
}

// Enhanced send function with debugging
export function sendRealTimeNotification(io, userId, notification) {
  try {
    if (!io) {
      console.warn('🔔 ⚠️ Socket.IO not available (e.g. worker process) - notification saved to DB only');
      return false;
    }
    const userRoom = `user:${userId}`;
    const notificationNamespace = io.of('/notifications');
    notificationNamespace.to(userRoom).emit('new-notification', notification);
    return true;
  } catch (error) {
    console.error('🔔 ❌ Error sending real-time notification:', error);
    return false;
  }
}

export function sendRealTimeDocumentStatus(io, userId, payload) {
  try {
    if (!io) {
      console.warn(
        '🔔 ⚠️ Socket.IO not available - document status update emitted to DB only',
      );
      return false;
    }

    const userRoom = `user:${userId}`;
    const notificationNamespace = io.of('/notifications');
    notificationNamespace.to(userRoom).emit('document-status-updated', payload);
    return true;
  } catch (error) {
    console.error('🔔 ❌ Error sending document status update:', error);
    return false;
  }
}
