// src/utils/tailoredApply.background.js

import { genAIRequest as genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
import {
  generateEmailPrompt,
  processEmailResponse,
} from '../prompt/generateEmail.js';

import { Student } from '../models/student.model.js';
import { User } from '../models/User.model.js';

import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';

import { wrapCVHtml } from '../utils/cvTemplate.js';
import { wrapEmailHtml } from '../utils/emailTemplate.js';

import { condenseExperience } from '../utils/cvCondense.js';
import { calculateATSScore } from '../utils/atsScore.js';

// ---------------- helpers ----------------

const stripCodeFences = (s) =>
  String(s || '')
    .replace(/```json|```html|```/g, '')
    .trim();

const FORBIDDEN_TAG_REGEX = /<(style|html|head|body|script|link)|style\s*=/i;

const genAIWithRetry = async (prompt) => {
  // retry handled inside gemini.js already
  return genAI(prompt);
};

// ---------------- main worker ----------------

export const processTailoredApplication = async (
  userId,
  applicationId,
  applicationData,
  io,
) => {
  try {
    // ---------- 1. Normalize candidate safely ----------
    let candidateObj = {};

    if (typeof applicationData.candidate === 'string') {
      try {
        candidateObj = JSON.parse(applicationData.candidate);
      } catch {
        candidateObj = {};
      }
    } else if (
      applicationData.candidate &&
      typeof applicationData.candidate === 'object'
    ) {
      candidateObj = applicationData.candidate;
    }

    // ---------- 2. Slim candidate (prompt control) ----------
    const slimCandidate = {
      fullName: candidateObj.fullName || '',
      email: candidateObj.email || '',
      phone: candidateObj.phone || '',
      location: candidateObj.location || '',
      jobRole: candidateObj.jobRole || '',
      education: candidateObj.education || [],
      experience: candidateObj.experience || [],
      skills: candidateObj.skills || [],
      projects: candidateObj.projects || [],
    };

    const sanitized = {
      ...applicationData,
      candidate: slimCandidate,
    };

    // ================= CV =================

    const cvPrompt = generateCVPrompt(
      sanitized.job.description,
      JSON.stringify(slimCandidate, null, 2),
      sanitized.preferences,
    );

    const cvRaw = await genAIWithRetry(cvPrompt);

    let parsedCV;
    try {
      parsedCV = JSON.parse(stripCodeFences(cvRaw));
    } catch {
      throw new Error('AI returned invalid CV JSON');
    }

    if (!parsedCV.cv || typeof parsedCV.cv !== 'string') {
      throw new Error('CV JSON missing required "cv" field');
    }

    if (FORBIDDEN_TAG_REGEX.test(parsedCV.cv)) {
      throw new Error('Invalid CV HTML returned by AI');
    }

    // ---- normalize CV (SAME AS CV PIPELINE) ----
    parsedCV.cv = condenseExperience(parsedCV.cv);
    parsedCV.cv = wrapCVHtml(parsedCV.cv, sanitized.job.title);

    parsedCV.atsScore = calculateATSScore(
      parsedCV.cv,
      sanitized.job.description,
    );
    parsedCV.atsScoreReasoning =
      parsedCV.atsScoreReasoning ||
      'Score calculated based on keyword overlap between job description and CV content.';

    // ================= COVER LETTER =================

    const clPrompt = generateCoverLetterPrompts(
      sanitized.job.title,
      JSON.stringify(slimCandidate),
      sanitized.preferences,
    );

    const clRaw = await genAIWithRetry(clPrompt);
    const tailoredCoverLetter = stripCodeFences(clRaw);

    if (FORBIDDEN_TAG_REGEX.test(tailoredCoverLetter)) {
      throw new Error('Invalid Cover Letter HTML returned by AI');
    }

    // ================= EMAIL =================

    // const emailPrompt = generateEmailPrompt(sanitized);
    // const emailRaw = await genAIWithRetry(emailPrompt);

    // let applicationEmail = processEmailResponse(emailRaw);

    // // deterministic name replacement
    // applicationEmail = applicationEmail.replace(
    //   /\[Your Name\]/gi,
    //   slimCandidate.fullName || '',
    // );

    const emailPrompt = generateEmailPrompt(sanitized);
    const emailRaw = await genAIWithRetry(emailPrompt);
    const emailText = processEmailResponse(emailRaw);

    // ---- parse deterministic sections ----
    const subjectMatch = emailText.match(/SUBJECT:\s*(.+)/i);
    const bodyMatch = emailText.match(/BODY:\s*([\s\S]*?)\nSIGNATURE:/i);
    const signatureMatch = emailText.match(/SIGNATURE:\s*(.+)/i);

    if (!subjectMatch || !bodyMatch) {
      throw new Error('Invalid email format returned by AI');
    }

    const subject = subjectMatch[1].trim();
    const body = bodyMatch[1].trim();
    const signature =
      signatureMatch?.[1]?.trim() || slimCandidate.fullName || '';

    // ---- wrap with template ----
    const applicationEmail = wrapEmailHtml(subject, body, signature);

    // ================= DB UPDATE =================

    await Student.updateOne(
      { _id: userId, 'tailoredApplications._id': applicationId },
      {
        $set: {
          'tailoredApplications.$.status': 'completed',
          'tailoredApplications.$.tailoredCV': parsedCV,
          'tailoredApplications.$.tailoredCoverLetter': tailoredCoverLetter,
          'tailoredApplications.$.applicationEmail': applicationEmail,
          'tailoredApplications.$.completedAt': new Date(),
        },
      },
    );

    await User.updateOne(
      { _id: userId },
      { $inc: { 'usageCounters.aiApplication': 1 } },
    );

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_SUCCESS(
        'Your tailored application is ready!',
        applicationId,
      ),
    );
  } catch (error) {
    console.error('[TAILORED APPLY FAILED]', error);

    await Student.updateOne(
      { _id: userId, 'tailoredApplications._id': applicationId },
      {
        $set: {
          'tailoredApplications.$.status': 'failed',
          'tailoredApplications.$.error': error.message,
          'tailoredApplications.$.completedAt': new Date(),
        },
      },
    );

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_FAILED(
        'Tailored application generation failed.',
        error.message,
      ),
    );
  }
};
