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
    actionUrl: '/dashboard/applications',
  }),

  JOB_APPLICATION_UPDATED: (jobTitle, status) => ({
    title: 'Application Status Updated',
    message: `Your application for "${jobTitle}" has been ${status}.`,
    type: 'info',
    category: 'application',
    actionUrl: '/dashboard/applications',
  }),

  PAYMENT_SUCCESS: (amount, plan) => ({
    title: 'Payment Successful',
    message: `Your payment of $${amount} for ${plan} plan has been processed successfully.`,
    type: 'success',
    category: 'payment',
    actionUrl: '/dashboard/billing',
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
    actionUrl: '/dashboard/search-jobs',
  }),

  PROFILE_COMPLETION_REMINDER: () => ({
    title: 'Complete Your Profile',
    message:
      'Complete your profile to get better job recommendations and higher application success.',
    type: 'warning',
    category: 'system',
    actionUrl: '/dashboard/profile',
  }),

  NEW_FEATURE_REQUEST: (featureName) => ({
    title: 'New Feature Request',
    message: `A new feature request for "${featureName}" has been submitted.`,
    type: 'info',
    category: 'feature',
    actionUrl: '/dashboard/features',
  }),

  CV_GENERATED_SUCCESS: (jobTitle, cvId, atsScore) => ({
    title: 'CV Generated',
    message: `Your tailored CV for ${jobTitle} is complete with a ${atsScore} match score. Download it now and apply with confidence.`,
    type: 'success',
    category: 'cv',
    actionUrl: `/dashboard/cv/${cvId}`,
  }),
  CV_GENERATED_FAILED: (jobTitle) => ({
    title: 'CV Generation Failed',
    message: `Failed to generate. Please try again.`,
    type: 'error',
    category: 'cv',
    actionUrl: `/dashboard/my-docs?tab=cvs`,
  }),
  COVER_LETTER_GENERATED_SUCCESS: (message, clId) => ({
    title: 'Cover Letter Ready!',
    message: message || 'Your cover letter has been generated successfully.',
    type: 'success',
    priority: 'medium',
    category: 'coverletter',
    actionUrl: `/dashboard/cl/${clId}`,
  }),

  COVER_LETTER_GENERATED_FAILED: (message, error) => ({
    title: 'Cover Letter Generation Failed',
    message: `Failed to generate cover letter for "${message}". ${error}`,
    type: 'error',
    priority: 'medium',
    category: 'coverletter',
    actionUrl: `/dashboard/my-docs?tab=cover-letters`,
  }),

  TAILORED_APPLICATION_GENERATED_SUCCESS: (message, applicationId) => ({
    title: 'Application Ready!',
    message:
      message || 'Your tailored application has been generated successfully.',
    type: 'success',
    priority: 'medium',
    category: 'application',
    actionUrl: `/dashboard/my-docs/application//${applicationId}`,
  }),

  TAILORED_APPLICATION_GENERATED_FAILED: (message, error) => ({
    title: 'Application Generation Failed',
    message: `Failed to generate tailored application. ${error}`,
    type: 'error',
    priority: 'medium',
    category: 'application',
    actionUrl: '/dashboard/my-docs?tab=applications',
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
