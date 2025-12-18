// src/utils/cv.background.js

import { genAIRequest as genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { Student } from '../models/student.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { User } from '../models/User.model.js';

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000; // 1s
const MAX_BACKOFF_MS = 60 * 1000; // 60s

function parseRetryDelayFromError(err) {
  // Google error sometimes includes RetryInfo in errorDetails with retryDelay "25s"
  try {
    if (err && Array.isArray(err.errorDetails)) {
      for (const d of err.errorDetails) {
        if (d['@type'] && d['@type'].includes('RetryInfo') && d.retryDelay) {
          const s = String(d.retryDelay);
          // common shape: "25s" or "25.868348239s"
          const match = s.match(/([\d.]+)s/);
          if (match) {
            const secs = parseFloat(match[1]);
            if (!Number.isNaN(secs))
              return Math.max(0, Math.floor(secs * 1000));
          }
        }
      }
    }
  } catch (e) {
    // ignore parse issues
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const processCVGeneration = async (
  userId,
  jobId,
  studentData,
  jobContextString,
  finalTouch,
  io,
  endpoint,
) => {
  let cvId = null;
  let jobTitle = 'your recent job';

  try {
    // Grab the CV subdocument created by initiateCVGeneration
    // We expect the cvs array to include the entry with jobId.
    const student = await Student.findOne(
      { _id: userId, 'cvs.jobId': jobId },
      { 'cvs.$': 1 },
    );

    if (!student || !student.cvs || !student.cvs.length) {
      throw new Error(`No CV found with jobId: ${jobId} for user: ${userId}`);
    }

    const cvSubDoc = student.cvs[0];
    cvId = cvSubDoc._id;
    jobTitle = cvSubDoc.jobTitle || jobTitle;

    const prompt = generateCVPrompt(jobContextString, studentData, finalTouch);

    let attempt = 0;
    let parsedJson = null;
    let lastErr = null;

    while (attempt < MAX_RETRIES) {
      attempt += 1;
      try {
        const rawJsonResponse = await genAI(prompt, {
          userId: userId,
          endpoint,
        });
        const cleanedJsonString = rawJsonResponse
          .replace(/```json|```/g, '')
          .trim();
        parsedJson = JSON.parse(cleanedJsonString);
        break; // success
      } catch (err) {
        lastErr = err;
        const retryDelayFromService = parseRetryDelayFromError(err);
        let backoff =
          retryDelayFromService ??
          Math.min(INITIAL_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);

        // add jitter +-25%
        const jitter = Math.floor(backoff * 0.25);
        backoff = Math.max(
          200,
          backoff + (Math.floor(Math.random() * (2 * jitter + 1)) - jitter),
        );

        // If this was the last attempt, break and surface the error
        if (attempt >= MAX_RETRIES) {
          console.error(
            `genAI failed after ${attempt} attempts`,
            err?.message || err,
          );
          break;
        }

        console.warn(
          `genAI attempt ${attempt} failed. Backing off ${backoff}ms. err=${
            err?.status || err?.message || err
          }`,
        );
        // sleep then retry
        await sleep(backoff);
      }
    }

    if (!parsedJson) {
      // Retries exhausted OR parse failure
      const errMessage = lastErr
        ? lastErr.message || JSON.stringify(lastErr)
        : 'Unknown generation error';
      // mark CV as queued if it's a quota issue (429) or failed transiently, so an external scheduler can retry later
      const isQuota = lastErr && lastErr.status === 429;

      const nextRetryAt = isQuota
        ? new Date(
            Date.now() + (parseRetryDelayFromError(lastErr) ?? 60 * 1000),
          ) // try again after service-suggested delay or 60s
        : null;

      const updateQueued = {
        $set: {
          'cvs.$.status': isQuota ? 'queued' : 'failed',
          'cvs.$.error': errMessage,
          'cvs.$.completedAt': new Date(),
        },
      };
      if (nextRetryAt) updateQueued.$set['cvs.$.nextRetryAt'] = nextRetryAt;

      await Student.updateOne({ 'cvs._id': cvId }, updateQueued);

      await sendRealTimeUserNotification(
        io,
        userId,
        isQuota
          ? notificationTemplates.CV_GENERATED_QUEUED(
              jobTitle,
              cvId,
              errMessage,
              nextRetryAt,
            )
          : notificationTemplates.CV_GENERATED_FAILED(jobTitle),
      );

      // stop processing since we couldn't generate content
      return;
    }

    // success — extract atsScore safely
    const atsScore = parsedJson.atsScore ?? 0;

    // Update subdocument: mark completed and save response
    const updateResult = await Student.updateOne(
      { 'cvs._id': cvId },
      {
        $set: {
          'cvs.$.status': 'completed',
          'cvs.$.cvData': parsedJson,
          'cvs.$.atsScore': atsScore,
          'cvs.$.completedAt': new Date(),
          'cvs.$.jobContextString': jobContextString,
          'cvs.$.finalTouch': finalTouch,
        },
      },
    );

    if (!updateResult || updateResult.matchedCount === 0) {
      throw new Error(`Failed to update CV with cvId: ${cvId} (match count 0)`);
    }

    // Only increment user's cvCreation usage AFTER successful persist of CV
    try {
      await User.updateOne(
        { _id: userId },
        {
          $inc: {
            'usageCounters.cvCreation': 1,
          },
        },
      );
    } catch (incErr) {
      // Log but don't fail the whole flow if increment fails
      console.error(
        `Failed to increment usageCounters.cvCreation for user ${userId}:`,
        incErr,
      );
    }

    // Notify success
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.CV_GENERATED_SUCCESS(jobTitle, cvId, atsScore),
    );
  } catch (error) {
    console.error(
      `CV generation failed for user: ${userId}, job: ${jobId}`,
      error,
    );
    const errorMessage =
      error?.message || 'An unknown error occurred during generation.';

    // If cvId known, update the specific subdoc; else update the student's cvs matching jobId
    const failureFilter = cvId
      ? { 'cvs._id': cvId }
      : { _id: userId, 'cvs.jobId': jobId };
    const setObj = {
      'cvs.$.status': 'failed',
      'cvs.$.error': errorMessage,
      'cvs.$.completedAt': new Date(),
    };

    try {
      await Student.updateOne(failureFilter, { $set: setObj });
    } catch (e) {
      console.error('Failed to persist failed state to Student model:', e);
    }

    const titleForFailure = jobTitle || 'your recent CV';
    try {
      await sendRealTimeUserNotification(
        io,
        userId,
        notificationTemplates.CV_GENERATED_FAILED(titleForFailure),
      );
    } catch (notifyErr) {
      console.error('Failed to send failure notification:', notifyErr);
    }
  }
};
