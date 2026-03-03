// src/utils/tailored.autopilot.js
import { genAIRequest as genAI } from '../config/gemini.js';
import {
  generateCVPrompts,
  generateCoverLetterPrompts,
  generateEmailPrompt,
} from './generateTailored.js';
// Removed unused Student import
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';

// Cleanup helpers
const processCVResponse = (response) =>
  response.replace(/```json|```/g, '').trim();
const processCoverLetterResponse = (response) =>
  response.replace(/```html|```/g, '').trim();
const processEmailResponse = (response) =>
  response.replace(/```html|```/g, '').trim();

const genAIWithRetry = async (
  prompt,
  endpoint,
  userId,
  retries = 3,
  delay = 1000,
) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Corrected arguments passed to genAI
      return await genAI(prompt, {
        userId: userId,
        endpoint: endpoint,
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
  endpoint,
) => {
  try {
    const data = normalizeApplicationData(applicationData);

    // 1) CV
    const cvResponse = await genAIWithRetry(
      generateCVPrompts(data),
      endpoint,
      userId,
    );
    const tailoredCV = processCVResponse(cvResponse);

    // 2) Cover Letter
    const coverLetterResponse = await genAIWithRetry(
      generateCoverLetterPrompts(data),
      endpoint,
      userId,
    );
    const tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);

    // 3) Email
    const emailResponse = await genAIWithRetry(
      generateEmailPrompt(data),
      endpoint,
      userId,
    );
    const applicationEmail = processEmailResponse(emailResponse);

    // ✅ FIX: Update the EXISTING application instead of creating a new one
    await StudentApplication.updateOne(
      { _id: applicationId },
      {
        $set: {
          cvContent: tailoredCV,
          coverLetterContent: tailoredCoverLetter,
          emailContent: applicationEmail, // Ensure field name matches schema (emailContent vs applicationEmail)
          status: 'Applied', // Matches worker status flow
          completedAt: new Date(),
        },
      },
    );

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

    return true;
  } catch (error) {
    console.error(
      `[TAILORED] FAIL user=${userId} app=${applicationId}:`,
      error?.stack || error?.message || error,
    );

    const errorMessage =
      error?.message || 'An unknown error occurred during generation.';

    try {
      await StudentApplication.updateOne(
        {
          _id: applicationId,
        },
        {
          $set: {
            status: 'Failed',
            error: errorMessage, // Ensure schema has 'error' field if you want to save this
            completedAt: new Date(),
          },
        },
      );
    } catch (updateErr) {
      console.error(
        '[TAILORED] Failed to mark application as failed:',
        updateErr,
      );
    }

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

    return false;
  }
};
