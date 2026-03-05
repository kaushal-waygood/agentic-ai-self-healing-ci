import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import { sendRealTimeNotification } from '../socket/notification.socket.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', authMiddleware, getUserNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.patch('/:notificationId/read', authMiddleware, markAsRead);
router.patch('/mark-all-read', authMiddleware, markAllAsRead);
router.delete('/:notificationId', authMiddleware, deleteNotification);

router.post('/test-notification', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io');
    const userId = req.user._id;

    const testNotification = {
      id: 'test-' + Date.now(),
      title: 'Test Notification',
      message:
        'This is a test notification sent at ' + new Date().toISOString(),
      type: 'info',
      isRead: false,
      createdAt: new Date(),
    };

    console.log(`🔔 🧪 Sending test notification to user ${userId}`);
    const result = sendRealTimeNotification(io, userId, testNotification);

    res.json({
      success: true,
      message: 'Test notification sent',
      notification: testNotification,
      sent: result,
    });
  } catch (error) {
    console.error('🔔 ❌ Test notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
