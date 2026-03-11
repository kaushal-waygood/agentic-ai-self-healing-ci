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
import redisClient from '../config/redis.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';

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

    const candidateRaw =
      typeof applicationData.candidate === 'string'
        ? JSON.parse(applicationData.candidate)
        : applicationData.candidate || {};

    const user = await Student.findById(userId).select(
      'fullName email phone location',
    );
    if (!user) throw new Error('User not found');

    /* --- STEP 0: ENSURE STRUCTURED DATA --- */
    let structuredCandidate;

    // If candidateRaw has education/experience arrays, it's already structured
    if (
      Array.isArray(candidateRaw.experience) &&
      candidateRaw.experience.length > 0
    ) {
      structuredCandidate = {
        ...candidateRaw,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
      };
    } else {
      // It's a raw CV string (file upload). We must parse it first.
      console.log(`[TAILORED APPLY] Parsing raw CV text for ${applicationId}`);
      const parsePrompt = `
        Extract all professional information from the following CV text. 
        Return ONLY a JSON object with these keys: 
        "education" (array of objects), "experience" (array of objects), "skills" (array or object), "projects" (array).
        
        CV TEXT:
        ${candidateRaw.cv || JSON.stringify(candidateRaw)}

        Rules: Do NOT invent data. If a section is missing, return an empty array.
      `;

      const rawParsed = await genAI(parsePrompt);
      const parsedData = JSON.parse(stripCodeFences(rawParsed));

      structuredCandidate = {
        ...parsedData,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
      };
    }

    /* ---------------- A. CV JSON generation ---------------- */
    // Now the prompt uses the REAL facts extracted above
    const cvPrompt = generateCVPrompt(
      applicationData.job.description,
      structuredCandidate,
      applicationData.preferences,
    );

    const rawCv = await genAI(cvPrompt);
    const parsedCv = JSON.parse(stripCodeFences(rawCv));

    /* ---------------- B. HTML rendering ---------------- */
    const innerHtml = renderResumeHtml(
      parsedCv,
      candidateRaw.profileImage || null,
      user.fullName,
      user.email,
      user.phone,
      user.location,
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
        parsedCv.atsScoreReasoning || 'Calculated based on role alignment.',
    };

    /* ---------------- C. Cover Letter & Email ---------------- */
    const clPrompt = generateCoverLetterPrompts(
      applicationData.job.title,
      JSON.stringify(structuredCandidate),
      applicationData.preferences,
    );
    const clRaw = await genAI(clPrompt);
    const coverLetterHtml = wrapCVHtml(stripCodeFences(clRaw), 'Cover Letter');

    const emailPrompt = generateEmailPrompt(applicationData);
    const emailRaw = await genAI(emailPrompt);
    const emailText = processEmailResponse(emailRaw);

    // Regex for Email parsing
    const subject =
      emailText.match(/SUBJECT:\s*(.+)/i)?.[1] || 'Job Application';
    const body =
      emailText.match(/BODY:\s*([\s\S]*?)\nSIGNATURE:/i)?.[1] || emailText;
    const signature =
      emailText.match(/SIGNATURE:\s*(.+)/i)?.[1] || user.fullName;

    const applicationEmail = {
      subject,
      body,
      signature,
      html: wrapEmailHtml(subject, body, signature),
    };

    /* ---------------- D. DB Update ---------------- */
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

    try {
      await redisClient.del(`dashboard:${userId}:ai-activity`);
    } catch (redisErr) {
      console.warn('[TAILORED APPLY] Redis cache clear failed (non-fatal):', redisErr?.message);
    }

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_SUCCESS(
        'Application tailored successfully',
        applicationId,
      ),
    );

    console.log(`[TAILORED APPLY] Success ${applicationId}`);
  } catch (err) {
    console.error(`[TAILORED APPLY FAILED]`, err);
    await StudentTailoredApplication.findByIdAndUpdate(applicationId, {
      $set: { status: 'failed', error: err.message, completedAt: new Date() },
    });
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_FAILED(
        'Application tailored failed',
        err.message,
      ),
    );
  }
};
