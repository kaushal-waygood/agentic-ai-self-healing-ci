import { genAIRequest as genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { StudentCV } from '../models/students/studentCV.model.js'; // Import the separate model
import { User } from '../models/User.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { wrapCVHtml } from '../utils/cvTemplate.js';
import { condenseExperience } from '../utils/cvCondense.js';
import { calculateATSScore } from '../utils/atsScore.js';

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000; // 1s
const MAX_BACKOFF_MS = 60 * 1000; // 60s

function parseRetryDelayFromError(err) {
  try {
    if (err && Array.isArray(err.errorDetails)) {
      for (const d of err.errorDetails) {
        if (d['@type'] && d['@type'].includes('RetryInfo') && d.retryDelay) {
          const s = String(d.retryDelay);
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
    const cvDoc = await StudentCV.findOne({
      student: userId,
      jobId: jobId,
    }).sort({ createdAt: -1 });

    if (!cvDoc) {
      throw new Error(
        `No StudentCV document found for user: ${userId} and job: ${jobId}`,
      );
    }

    cvId = cvDoc._id;
    jobTitle = cvDoc.cvTitle || jobTitle;

    // 2. Prepare Prompt
    const prompt = generateCVPrompt(jobContextString, studentData, finalTouch);

    let attempt = 0;
    let parsedJson = null;
    let lastErr = null;

    // 3. AI Generation Loop (Retries)
    while (attempt < MAX_RETRIES) {
      attempt += 1;
      try {
        const rawJsonResponse = await genAI(prompt, {
          userId,
          endpoint,
        });

        const cleanedJsonString = rawJsonResponse
          .replace(/```json|```/g, '')
          .trim();
        parsedJson = JSON.parse(cleanedJsonString);

        // Security check
        if (
          /<(style|html|head|body|script|link)|style\s*=/i.test(parsedJson.cv)
        ) {
          throw new Error('Invalid CV HTML: forbidden tags detected');
        }

        // Post-processing
        parsedJson.cv = condenseExperience(parsedJson.cv);
        parsedJson.cv = wrapCVHtml(parsedJson.cv, jobTitle);

        // ATS Score
        const atsScore = calculateATSScore(parsedJson.cv, jobContextString);
        parsedJson.atsScore = atsScore;
        parsedJson.atsScoreReasoning =
          parsedJson.atsScoreReasoning ||
          'Score calculated based on keyword overlap.';

        break; // Success
      } catch (err) {
        lastErr = err;
        const retryDelayFromService = parseRetryDelayFromError(err);
        let backoff =
          retryDelayFromService ??
          Math.min(INITIAL_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);

        // Jitter
        const jitter = Math.floor(backoff * 0.25);
        backoff = Math.max(
          200,
          backoff + (Math.floor(Math.random() * (2 * jitter + 1)) - jitter),
        );

        if (attempt >= MAX_RETRIES) {
          console.error(
            `genAI failed after ${attempt} attempts`,
            err?.message || err,
          );
          break;
        }

        console.warn(
          `genAI attempt ${attempt} failed. Retrying in ${backoff}ms.`,
        );
        await sleep(backoff);
      }
    }

    // 4. Handle Failure (Retries Exhausted)
    if (!parsedJson) {
      const errMessage = lastErr
        ? lastErr.message || JSON.stringify(lastErr)
        : 'Unknown generation error';

      const isQuota = lastErr && lastErr.status === 429;
      const nextRetryAt = isQuota
        ? new Date(
            Date.now() + (parseRetryDelayFromError(lastErr) ?? 60 * 1000),
          )
        : null;

      // Update StudentCV status to failed/queued
      const updateData = {
        status: isQuota ? 'queued' : 'failed',
        error: errMessage,
        completedAt: new Date(),
      };

      // Note: 'nextRetryAt' isn't in standard schema, but we can log it or
      // rely on an external scheduler picking up 'queued' items.

      await StudentCV.findByIdAndUpdate(cvId, { $set: updateData });

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

      return; // Stop processing
    }

    // 5. Handle Success
    const atsScore = parsedJson.atsScore ?? 0;

    // Update StudentCV with results
    const updateResult = await StudentCV.findByIdAndUpdate(cvId, {
      $set: {
        status: 'completed',
        cvData: parsedJson, // Stores HTML, ATS score, and reasoning
        completedAt: new Date(),
        // Update context fields in case they changed during processing logic
        jobContextString: jobContextString,
        finalTouch: finalTouch,
      },
    });

    if (!updateResult) {
      throw new Error(`Failed to update StudentCV with ID: ${cvId}`);
    }

    // Increment Usage Stats on User model
    try {
      await User.updateOne(
        { _id: userId },
        { $inc: { 'usageCounters.cvCreation': 1 } },
      );
    } catch (incErr) {
      console.error(`Failed to increment usage for user ${userId}:`, incErr);
    }

    // Send Notification
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.CV_GENERATED_SUCCESS(jobTitle, cvId, atsScore),
    );
  } catch (error) {
    console.error(
      `CV generation process failed for user: ${userId}, job: ${jobId}`,
      error,
    );

    const errorMessage =
      error?.message || 'An unknown error occurred during generation.';

    // Fallback failure update
    if (cvId) {
      try {
        await StudentCV.findByIdAndUpdate(cvId, {
          $set: {
            status: 'failed',
            error: errorMessage,
            completedAt: new Date(),
          },
        });
      } catch (e) {
        console.error('Failed to persist error state to StudentCV:', e);
      }
    }

    // Fallback Notification
    try {
      await sendRealTimeUserNotification(
        io,
        userId,
        notificationTemplates.CV_GENERATED_FAILED(jobTitle),
      );
    } catch (notifyErr) {
      console.error('Failed to send failure notification:', notifyErr);
    }
  }
};
