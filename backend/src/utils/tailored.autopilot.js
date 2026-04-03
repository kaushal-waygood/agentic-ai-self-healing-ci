import { genAIRequest as genAI } from '../config/gemini.js';
import {
  generateCVPrompts,
  generateCoverLetterPrompts,
  generateEmailPrompt,
} from './generateTailored.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { sendRealTimeDocumentStatus } from '../socket/notification.socket.js';

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
      return await genAI(prompt, { userId, endpoint });
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

const normalizeApplicationData = (raw) => {
  // Already normalised (has candidate at top level)
  if (raw?.candidate) return raw;
  // Legacy shape: { student, job, finalTouch }
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

const resolveModel = (modelType) => {
  if (modelType === 'StudentTailoredApplication')
    return StudentTailoredApplication;
  return StudentApplication; // safe default
};

// ── Main export ──────────────────────────────────────────────

/**
 * Generate CV, Cover Letter, and Email for a single application,
 * then persist the results to the correct model.
 *
 * @param {ObjectId|string} userId
 * @param {ObjectId|string} applicationId
 * @param {object}          applicationData   — { job, candidate, coverLetter, preferences }
 * @param {object|null}     io                — socket.io instance (optional)
 * @param {string|null}     endpoint          — Gemini endpoint override (optional)
 * @param {object}          options
 * @param {'StudentApplication'|'StudentTailoredApplication'} options.modelType
 *   Which Mongoose model holds the record. Default: 'StudentApplication'.
 * @param {{ success: string, failed: string }} options.statusMap
 *   Status strings to set on success/failure.
 *   Default: { success: 'Applied', failed: 'Failed' }
 */
export const processTailoredApplication = async (
  userId,
  applicationId,
  applicationData,
  io,
  endpoint,
  {
    modelType = 'StudentApplication',
    statusMap = { success: 'Applied', failed: 'Failed' },
    rethrowOnError = false,
  } = {},
) => {
  const Model = resolveModel(modelType);

  try {
    const data = normalizeApplicationData(applicationData);

    // Generate all three assets in parallel to reduce end-to-end latency.
    const [cvResponse, coverLetterResponse, emailResponse] = await Promise.all([
      genAIWithRetry(generateCVPrompts(data), endpoint, userId),
      genAIWithRetry(generateCoverLetterPrompts(data), endpoint, userId),
      genAIWithRetry(generateEmailPrompt(data), endpoint, userId),
    ]);

    const tailoredCV = processCVResponse(cvResponse);
    const tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);
    const applicationEmail = processEmailResponse(emailResponse);

    // ✅ Save to whichever model created the record
    await Model.updateOne(
      { _id: applicationId },
      {
        $set: {
          cvContent: tailoredCV,
          coverLetterContent: tailoredCoverLetter,
          emailContent: applicationEmail,
          status: statusMap.success,
          completedAt: new Date(),
          error: null,
        },
      },
    );

    // Real-time notification (best-effort)
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

    sendRealTimeDocumentStatus(io, userId, {
      documentId: String(applicationId),
      documentType: 'application',
      status: statusMap.success === 'Failed' ? 'failed' : 'completed',
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error(
      `[TAILORED] FAIL user=${userId} app=${applicationId}:`,
      error?.stack || error?.message || error,
    );

    const errorMessage =
      error?.message || 'An unknown error occurred during generation.';

    try {
      await Model.updateOne(
        { _id: applicationId },
        {
          $set: {
            status: statusMap.failed,
            error: errorMessage,
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

    sendRealTimeDocumentStatus(io, userId, {
      documentId: String(applicationId),
      documentType: 'application',
      status: 'failed',
      updatedAt: new Date().toISOString(),
      error: errorMessage,
    });

    if (rethrowOnError) {
      throw error;
    }

    return false;
  }
};
