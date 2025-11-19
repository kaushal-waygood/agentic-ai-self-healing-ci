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
import { User } from '../models/User.model.js';

// Cleanup helpers
const processCVResponse = (response) =>
  response.replace(/```json|```/g, '').trim();
const processCoverLetterResponse = (response) =>
  response.replace(/```html|```/g, '').trim();
const processEmailResponse = (response) =>
  response.replace(/```html|```/g, '').trim();

// ---------- Prompt sanitization & limits ----------
const MAX_PROMPT_CHARS = 50000; // tune as needed; safer ceiling for prompt payloads
const PROMPT_HARD_LIMIT = 200000; // absolute hard limit (gemini.js also checks)

function stripHtmlAndCompress(s = '') {
  return String(s || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeDataForPrompt(data) {
  const job = { ...(data.job || {}) };
  let candidateStr =
    typeof data.candidate === 'string'
      ? data.candidate
      : JSON.stringify(data.candidate || {});

  candidateStr = stripHtmlAndCompress(candidateStr);

  job.title = stripHtmlAndCompress(job.title || '').slice(0, 200);
  job.company = stripHtmlAndCompress(job.company || '').slice(0, 200);
  job.description = stripHtmlAndCompress(job.description || '').slice(0, 15000);

  // Assemble for length check
  let assembled = `${job.title}\n${job.company}\n${job.description}\n${candidateStr}`;
  if (assembled.length > MAX_PROMPT_CHARS) {
    // shrink progressively
    job.description = job.description.slice(0, 8000);
    candidateStr = candidateStr.slice(0, 20000);
    assembled = `${job.title}\n${job.company}\n${job.description}\n${candidateStr}`;
  }

  // final fallback shrink
  if (assembled.length > MAX_PROMPT_CHARS) {
    job.description = job.description.slice(0, 5000);
    candidateStr = candidateStr.slice(0, 15000);
  }

  return {
    job,
    candidate: candidateStr,
    coverLetter: data.coverLetter,
    preferences: data.preferences,
  };
}

// ---------- Single retry wrapper (429-aware) ----------
const defaultRetryConfig = { retries: 4, baseDelay: 1000, maxDelay: 20000 };

const genAIWithRetry = async (prompt, opts = {}) => {
  const retryOpts = { ...defaultRetryConfig, ...(opts.retry || {}) };
  const { retries, baseDelay, maxDelay } = retryOpts;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // genAI now accepts options param (gemini.js)
      return await genAI(prompt, opts);
    } catch (err) {
      const status = err?.status;
      // bail on client errors (except rate limit)
      if ([400, 401, 403].includes(status)) throw err;

      // compute backoff: longer for 429s
      const backoffBase = status === 429 ? baseDelay * 2 : baseDelay;
      const delay = Math.min(
        backoffBase * Math.pow(2, attempt - 1) +
          Math.floor(Math.random() * 1000),
        maxDelay,
      );

      console.warn(
        `AI call failed (status=${status}) attempt=${attempt}/${retries}. retrying in ${delay}ms`,
      );
      if (attempt === retries) throw err;
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

    // Sanitize and shrink heavy fields before generating prompts
    const sanitized = sanitizeDataForPrompt(data);

    // 1) CV
    const cvPromptPayload = generateCVPrompts(sanitized);
    if (String(cvPromptPayload).length > PROMPT_HARD_LIMIT) {
      throw Object.assign(new Error('CV prompt too large after sanitization'), {
        status: 400,
      });
    }
    const cvResponse = await genAIWithRetry(cvPromptPayload);
    const tailoredCV = processCVResponse(cvResponse);

    // 2) Cover Letter
    const clPromptPayload = generateCoverLetterPrompts(sanitized);
    if (String(clPromptPayload).length > PROMPT_HARD_LIMIT) {
      throw Object.assign(
        new Error('Cover letter prompt too large after sanitization'),
        { status: 400 },
      );
    }
    const coverLetterResponse = await genAIWithRetry(clPromptPayload);
    const tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);

    // 3) Email
    const emailPromptPayload = generateEmailPrompt(sanitized);
    if (String(emailPromptPayload).length > PROMPT_HARD_LIMIT) {
      throw Object.assign(
        new Error('Email prompt too large after sanitization'),
        { status: 400 },
      );
    }
    const emailResponse = await genAIWithRetry(emailPromptPayload);
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
      },
    );

    await User.updateOne(
      {
        _id: userId,
      },
      {
        $inc: {
          'usageCounters.aiApplication': 1,
        },
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
