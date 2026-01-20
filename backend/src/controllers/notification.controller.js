// controllers/notification.controller.js
import createHttpError from 'http-errors';
import * as notificationService from '../services/notification.service.js';

// Get user notifications
export async function getUserNotifications(req, res) {
  try {
    const userId = req.user._id;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      isRead: req.query.isRead ? req.query.isRead === 'true' : undefined,
      type: req.query.type,
      category: req.query.category,
      priority: req.query.priority,
    };

    const result = await notificationService.getUserNotifications(
      userId,
      options,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await notificationService.markAsRead(
      notificationId,
      userId,
    );

    if (!notification) {
      throw createHttpError(404, 'Notification not found');
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Mark all notifications as read
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user._id;

    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await notificationService.deleteNotification(
      notificationId,
      userId,
    );

    if (!notification) {
      throw createHttpError(404, 'Notification not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get unread count
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user._id;

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
