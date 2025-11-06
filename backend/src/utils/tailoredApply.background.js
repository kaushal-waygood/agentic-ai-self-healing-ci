// src/utils/tailoredApply.background.js
import { genAI } from '../config/gemini.js';
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

// Retry wrapper
const genAIWithRetry = async (prompt, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await genAI(prompt);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`AI call failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

// Normalize payload so both API path and worker path work
const normalizeApplicationData = (raw) => {
  // API shape: { job: {title, company, description}, candidate: JSON, coverLetter, preferences }
  // Worker shape (old): { job: {...rich}, student: {...}, finalTouch }
  if (raw?.candidate) {
    return raw;
  }
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
  console.log(`[TAILORED] START user=${userId} app=${applicationId}`);
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

    console.log('[TAILORED] updateOne result:', updateResult);
    if (updateResult.matchedCount === 0) {
      throw new Error(
        `No application found with ID: ${applicationId} for user: ${userId}`,
      );
    }

    // Notify
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_SUCCESS(
        'Your tailored application is ready!',
        applicationId,
      ),
    );

    console.log(
      `[TAILORED] DONE user=${userId} app=${applicationId} status=completed`,
    );
  } catch (error) {
    console.error(
      `[TAILORED] FAIL user=${userId} app=${applicationId}:`,
      error?.message || error,
    );

    const errorMessage =
      error?.message || 'An unknown error occurred during generation.';

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

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_FAILED(
        'Tailored application generation failed.',
        errorMessage,
      ),
    );
  }
};
