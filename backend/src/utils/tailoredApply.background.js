import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { User } from '../models/User.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';

import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
import {
  generateEmailPrompt,
  processEmailResponse,
} from '../prompt/generateEmail.js';

import { genAIRequest as genAI } from '../config/gemini.js';
import { renderResumeHtml } from '../utils/cv/cvRenderer.js';
import { wrapCVHtml } from '../utils/cvTemplate.js';
import { wrapEmailHtml } from '../utils/emailTemplate.js';
import { calculateATSScore } from '../utils/atsScore.js';
import { Student } from '../models/student.model.js';

const stripCodeFences = (s) =>
  String(s || '')
    .replace(/```json|```/g, '')
    .trim();

const ensureArray = (v) => (Array.isArray(v) ? v : []);

export const processTailoredApplication = async (
  userId,
  applicationId,
  applicationData,
  io,
) => {
  console.log(`[TAILORED APPLY] Start ${applicationId}`);

  try {
    const appDoc = await StudentTailoredApplication.findById(applicationId);
    if (!appDoc) throw new Error('Application not found');

    /* ---------------- Candidate normalization ---------------- */
    const candidate =
      typeof applicationData.candidate === 'string'
        ? JSON.parse(applicationData.candidate)
        : applicationData.candidate || {};

    const user = await Student.findById(userId).select(
      'fullName email phone location profileImage jobRole',
    );
    if (!user) throw new Error('User not found');
    const { fullName, email, phone, location, profileImage, jobRole } = user;
    const slimCandidate = {
      fullName,
      email,
      phone,
      location,
      education: ensureArray(candidate.education),
      experience: ensureArray(candidate.experience),
      skills: ensureArray(candidate.skills),
      projects: ensureArray(candidate.projects),
    };

    console.log('slimCandidate', slimCandidate);

    /* ---------------- A. CV JSON generation ---------------- */
    const cvPrompt = generateCVPrompt(
      applicationData.job.description,
      slimCandidate,
      applicationData.preferences,
    );

    const rawCv = await genAI(cvPrompt);
    const parsedCv = JSON.parse(stripCodeFences(rawCv));

    /* ---------------- B. HTML rendering (YOU own this) ---------------- */
    const innerHtml = renderResumeHtml(
      parsedCv,
      candidate.profileImage,
      fullName,
      email,
      phone,
      location,
    );

    const fullCvHtml = wrapCVHtml(innerHtml, applicationData.job.title);

    const atsScore =
      parsedCv.atsScore ||
      calculateATSScore(
        JSON.stringify(parsedCv),
        applicationData.job.description,
      );

    const tailoredCV = {
      ...parsedCv,
      cv: fullCvHtml,
      atsScore,
      atsScoreReasoning:
        parsedCv.atsScoreReasoning ||
        'Calculated using keyword relevance and role alignment.',
    };

    /* ---------------- C. Cover Letter ---------------- */
    const clPrompt = generateCoverLetterPrompts(
      applicationData.job.title,
      JSON.stringify(slimCandidate),
      applicationData.preferences,
    );

    const clRaw = await genAI(clPrompt);
    const coverLetterHtml = wrapCVHtml(stripCodeFences(clRaw), 'Cover Letter');

    /* ---------------- D. Email ---------------- */
    const emailPrompt = generateEmailPrompt(applicationData);
    const emailRaw = await genAI(emailPrompt);
    const emailText = processEmailResponse(emailRaw);

    const subject =
      emailText.match(/SUBJECT:\s*(.+)/i)?.[1] || 'Job Application';

    const body =
      emailText.match(/BODY:\s*([\s\S]*?)\nSIGNATURE:/i)?.[1] || emailText;

    const signature =
      emailText.match(/SIGNATURE:\s*(.+)/i)?.[1] || candidate.fullName;

    const applicationEmail = {
      subject,
      body,
      signature,
      html: wrapEmailHtml(subject, body, signature),
    };

    /* ---------------- E. DB Update ---------------- */
    await StudentTailoredApplication.findByIdAndUpdate(applicationId, {
      $set: {
        status: 'completed',
        tailoredCV,
        tailoredCoverLetter: { html: coverLetterHtml },
        applicationEmail,
        completedAt: new Date(),
        error: null,
      },
    });

    await User.updateOne(
      { _id: userId },
      { $inc: { 'usageCounters.aiApplication': 1 } },
    );

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_SUCCESS(
        'Your tailored application is ready',
        applicationId,
      ),
    );

    console.log(`[TAILORED APPLY] Success ${applicationId}`);
  } catch (err) {
    console.error(`[TAILORED APPLY FAILED]`, err);

    await StudentTailoredApplication.findByIdAndUpdate(applicationId, {
      $set: {
        status: 'failed',
        error: err.message,
        completedAt: new Date(),
      },
    });

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_FAILED(
        'Tailored application failed',
        err.message,
      ),
    );
  }
};
