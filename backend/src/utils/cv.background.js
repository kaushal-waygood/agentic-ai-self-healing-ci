import { genAIRequest as genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { renderResumeHtml } from '../utils/cv/cvRenderer.js'; // <--- NEW IMPORT
import { wrapCVHtml } from '../utils/cvTemplate.js';
import { StudentCV } from '../models/students/studentCV.model.js';
import { User } from '../models/User.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { calculateATSScore } from '../utils/atsScore.js';
import { logToFile } from './logFile.js';
import { Student } from '../models/student.model.js';

// Constants for retry logic
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 60 * 1000;

// Helper: Parse retry delay from Google Generative AI error
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

// Helper: Sleep function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main CV Generation Controller Function
 */
export const processCVGeneration = async (
  userId,
  jobId,
  studentData,
  jobContextString,
  finalTouch,
  io,
  endpoint,
  templateId = 'classic', // <--- Accept Template ID (Default: classic)
) => {
  let cvId = null;
  let jobTitle = 'your recent job';

  try {
    // 1. Fetch the existing placeholder CV document
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

    // 2. Prepare Prompt (Note: Ensure this prompt asks for JSON output now)
    const prompt = generateCVPrompt(jobContextString, studentData, finalTouch);

    let attempt = 0;
    let finalCvData = null; // Will hold the final structure to save
    let lastErr = null;

    const { profileImage, fullName, email, phone, location } =
      await Student.findById(userId)
        .select('profileImage fullName email phone location')
        .lean();

    console.log(profileImage, fullName, email, phone, location);

    // 3. AI Generation Loop (Retries)
    while (attempt < MAX_RETRIES) {
      attempt += 1;
      try {
        // A. Call AI
        const rawJsonResponse = await genAI(prompt, {
          userId,
          endpoint,
        });

        const cleanedJsonString = rawJsonResponse
          .replace(/```json|```/g, '')
          .trim();

        const parsedData = JSON.parse(cleanedJsonString);

        const { student } = JSON.parse(studentData);

        const innerHtmlBody = renderResumeHtml(
          parsedData,
          profileImage,
          fullName,
          email,
          phone,
          location,
        );

        const fullHtmlDocument = wrapCVHtml(
          innerHtmlBody,
          jobTitle,
          templateId,
        );

        const atsScore =
          parsedData.atsScore ||
          calculateATSScore(JSON.stringify(parsedData), jobContextString);

        finalCvData = {
          ...parsedData,
          cv: fullHtmlDocument,
          atsScore: atsScore,
          atsScoreReasoning:
            parsedData.atsScoreReasoning ||
            'Score calculated based on keyword match strength.',
        };

        break; // Success! Exit loop.
      } catch (err) {
        lastErr = err;
        // logic for exponential backoff
        const retryDelayFromService = parseRetryDelayFromError(err);
        let backoff =
          retryDelayFromService ??
          Math.min(INITIAL_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);
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
    if (!finalCvData) {
      const errMessage = lastErr
        ? lastErr.message || JSON.stringify(lastErr)
        : 'Unknown generation error';

      const isQuota = lastErr && lastErr.status === 429;
      const nextRetryAt = isQuota
        ? new Date(
            Date.now() + (parseRetryDelayFromError(lastErr) ?? 60 * 1000),
          )
        : null;

      await StudentCV.findByIdAndUpdate(cvId, {
        $set: {
          status: isQuota ? 'queued' : 'failed',
          error: errMessage,
          completedAt: new Date(),
        },
      });

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

      return;
    }

    // 5. Handle Success: Database Update
    const updateResult = await StudentCV.findByIdAndUpdate(cvId, {
      $set: {
        status: 'completed',
        cvData: finalCvData, // Contains 'cv' (HTML) and raw JSON fields
        completedAt: new Date(),
        jobContextString: jobContextString,
        finalTouch: finalTouch,
        selectedTemplate: templateId, // Save which template was used
      },
    });

    if (!updateResult) {
      throw new Error(`Failed to update StudentCV with ID: ${cvId}`);
    }

    // 6. Increment Usage Stats
    try {
      await User.updateOne(
        { _id: userId },
        { $inc: { 'usageCounters.cvCreation': 1 } },
      );
    } catch (incErr) {
      console.error(`Failed to increment usage for user ${userId}:`, incErr);
    }

    // 7. Send Success Notification
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.CV_GENERATED_SUCCESS(
        jobTitle,
        cvId,
        finalCvData.atsScore,
      ),
    );
  } catch (error) {
    console.error(
      `CV generation process failed for user: ${userId}, job: ${jobId}`,
      error,
    );

    const errorMessage =
      error?.message || 'An unknown error occurred during generation.';

    // Fallback: Try to save error state
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
