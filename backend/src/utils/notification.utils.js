// utils/notification.utils.js
import * as notificationService from '../services/notification.service.js';
import { sendRealTimeNotification } from '../socket/notification.socket.js';

// Common notification templates
export const notificationTemplates = {
  JOB_APPLICATION_SUBMITTED: (jobTitle) => ({
    title: 'Application Submitted',
    message: `Your application for "${jobTitle}" has been submitted successfully.`,
    type: 'success',
    category: 'application',
    actionUrl: '/applications',
  }),

  JOB_APPLICATION_UPDATED: (jobTitle, status) => ({
    title: 'Application Status Updated',
    message: `Your application for "${jobTitle}" has been ${status}.`,
    type: 'info',
    category: 'application',
    actionUrl: '/applications',
  }),

  PAYMENT_SUCCESS: (amount, plan) => ({
    title: 'Payment Successful',
    message: `Your payment of $${amount} for ${plan} plan has been processed successfully.`,
    type: 'success',
    category: 'payment',
    actionUrl: '/billing',
  }),

  SYSTEM_MAINTENANCE: (schedule) => ({
    title: 'System Maintenance',
    message: `Scheduled maintenance: ${schedule}. The system may be temporarily unavailable.`,
    type: 'warning',
    category: 'system',
    priority: 'medium',
  }),

  SECURITY_ALERT: (action) => ({
    title: 'Security Alert',
    message: `Unusual activity detected: ${action}. Please review your account security.`,
    type: 'error',
    category: 'security',
    priority: 'high',
  }),

  NEW_JOB_MATCH: (jobTitle, company) => ({
    title: 'New Job Match',
    message: `We found a new job "${jobTitle}" at ${company} that matches your profile.`,
    type: 'info',
    category: 'job',
    actionUrl: '/jobs',
  }),

  PROFILE_COMPLETION_REMINDER: () => ({
    title: 'Complete Your Profile',
    message:
      'Complete your profile to get better job recommendations and higher application success.',
    type: 'warning',
    category: 'system',
    actionUrl: '/profile',
  }),

  NEW_FEATURE_REQUEST: (featureName) => ({
    title: 'New Feature Request',
    message: `A new feature request for "${featureName}" has been submitted.`,
    type: 'info',
    category: 'feature',
    actionUrl: '/features',
  }),

  CV_GENERATED_SUCCESS: (jobTitle) => ({
    title: 'CV Generated',
    message: `Your CV for "${jobTitle}" has been generated successfully.`,
    type: 'success',
    category: 'cv',
    actionUrl: '/cv',
  }),
  CV_GENERATED_FAILED: (jobTitle) => ({
    title: 'CV Generation Failed',
    message: `Failed to generate CV for "${jobTitle}". Please try again.`,
    type: 'error',
    category: 'cv',
    actionUrl: '/cv',
  }),
};

// Send notification to single user
export async function sendUserNotification(userId, data) {
  const notification = await notificationService.createNotification({
    userId,
    ...data,
  });
  return notification;
}

// Send notifications to multiple users
export async function sendBulkNotifications(userIds, data) {
  const notificationsData = userIds.map((userId) => ({
    userId,
    ...data,
  }));

  return await notificationService.createBulkNotifications(notificationsData);
}

// Send templated notification
export async function sendTemplatedNotification(
  userId,
  templateKey,
  templateData,
) {
  const template = notificationTemplates[templateKey];

  if (!template) {
    throw new Error(`Notification template ${templateKey} not found`);
  }

  const notificationData =
    typeof template === 'function' ? template(...templateData) : template;

  return await sendUserNotification(userId, notificationData);
}

// Send notification with real-time update
export async function sendRealTimeUserNotification(io, userId, data) {
  const notification = await sendUserNotification(userId, data);

  // Send real-time update
  sendRealTimeNotification(io, userId, notification);

  return notification;
}
