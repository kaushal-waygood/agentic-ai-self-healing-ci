// src/utils/tailored.autopilot.js
import { genAIRequest as genAI } from '../config/gemini.js';
import {
  generateCVPrompts,
  generateCoverLetterPrompts,
  generateEmailPrompt,
} from './generateTailored.js';
import { Student } from '../models/student.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';

// Cleanup helpers
const processCVResponse = (response) =>
  response.replace(/```json|```/g, '').trim();
const processCoverLetterResponse = (response) =>
  response.replace(/```html|```/g, '').trim();
const processEmailResponse = (response) =>
  response.replace(/```html|```/g, '').trim();

const genAIWithRetry = async (prompt, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await genAI(prompt, {
        userId: req.user?._id,
        endpoint: req.endpoint,
      });
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

// Normalize payload so both API path and worker path work
const normalizeApplicationData = (raw) => {
  if (raw?.candidate) return raw;
  return {
    job: {
      title: raw?.job?.title || '',
      company: raw?.job?.company || '',
      description: raw?.job?.description || '',
    },
    candidate: JSON.stringify(raw?.student || {}),
    coverLetter: '',
    preferences: raw?.finalTouch || '',
  };
};

export const processTailoredApplication = async (
  userId,
  applicationId,
  applicationData,
  io,
) => {
  try {
    const data = normalizeApplicationData(applicationData);

    // 1) CV
    const cvResponse = await genAIWithRetry(generateCVPrompts(data));
    const tailoredCV = processCVResponse(cvResponse);

    // 2) Cover Letter
    const coverLetterResponse = await genAIWithRetry(
      generateCoverLetterPrompts(data),
    );
    const tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);

    // 3) Email
    const emailResponse = await genAIWithRetry(generateEmailPrompt(data));
    const applicationEmail = processEmailResponse(emailResponse);

    // Update application subdoc
    const updateResult = await Student.updateOne(
      {
        _id: userId,
        'tailoredApplications._id': applicationId,
      },
      {
        $set: {
          'tailoredApplications.$.status': 'completed',
          'tailoredApplications.$.tailoredCV': tailoredCV,
          'tailoredApplications.$.tailoredCoverLetter': tailoredCoverLetter,
          'tailoredApplications.$.applicationEmail': applicationEmail,
          'tailoredApplications.$.completedAt': new Date(),
        },
        $inc: { 'usageCounters.tailoredApplications': 1 },
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(
        `No application found with ID: ${applicationId} for user: ${userId}`,
      );
    }

    // Notify (null-safe)
    try {
      if (io) {
        await sendRealTimeUserNotification(
          io,
          userId,
          notificationTemplates.TAILORED_APPLICATION_GENERATED_SUCCESS(
            'Your tailored application is ready!',
            applicationId,
          ),
        );
      }
    } catch (notifyErr) {
      console.warn(
        '[TAILORED] Notification failed:',
        notifyErr?.message || notifyErr,
      );
    }
  } catch (error) {
    console.error(
      `[TAILORED] FAIL user=${userId} app=${applicationId}:`,
      error?.stack || error?.message || error,
    );

    const errorMessage =
      error?.message || 'An unknown error occurred during generation.';

    try {
      await Student.updateOne(
        {
          _id: userId,
          'tailoredApplications._id': applicationId,
        },
        {
          $set: {
            'tailoredApplications.$.status': 'failed',
            'tailoredApplications.$.error': errorMessage,
            'tailoredApplications.$.completedAt': new Date(),
          },
        },
      );
    } catch (updateErr) {
      console.error(
        '[TAILORED] Failed to mark application as failed:',
        updateErr,
      );
    }

    // Notify (null-safe)
    try {
      if (io) {
        await sendRealTimeUserNotification(
          io,
          userId,
          notificationTemplates.TAILORED_APPLICATION_GENERATED_FAILED(
            'Tailored application generation failed.',
            errorMessage,
          ),
        );
      }
    } catch (notifyErr) {
      console.warn(
        '[TAILORED] Notification failed (error path):',
        notifyErr?.message || notifyErr,
      );
    }
  }
};
