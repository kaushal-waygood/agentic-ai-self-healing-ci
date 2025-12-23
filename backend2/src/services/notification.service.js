// services/notification.service.js
import { Notification } from '../models/notification.model.js';

// Create a new notification
export async function createNotification(notificationData) {
  try {
    const notification = new Notification(notificationData);
    return await notification.save();
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

// Create multiple notifications at once
export async function createBulkNotifications(notificationsData) {
  try {
    return await Notification.insertMany(notificationsData);
  } catch (error) {
    throw new Error(`Failed to create bulk notifications: ${error.message}`);
  }
}

// Get user notifications with pagination
export async function getUserNotifications(userId, options = {}) {
  const { page = 1, limit = 20, isRead, type, category, priority } = options;

  const filter = { userId };

  if (isRead !== undefined) filter.isRead = isRead;
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Mark notification as read
export async function markAsRead(notificationId, userId) {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true },
  );
}

// Mark all user notifications as read
export async function markAllAsRead(userId) {
  return await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true },
  );
}

// Delete a notification
export async function deleteNotification(notificationId, userId) {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });
}

// Get unread count for user
export async function getUnreadCount(userId) {
  return await Notification.countDocuments({
    userId,
    isRead: false,
  });
}

// Clean up old notifications (for cron job)
export async function cleanupOldNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true,
  });

  return result;
}
