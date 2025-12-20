// src/utils/tailoredApply.background.js
import { genAIRequest as genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
import {
  generateEmailPrompt,
  processEmailResponse,
} from '../prompt/generateEmail.js';
import { Student } from '../models/student.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { User } from '../models/User.model.js';

const processCVResponse = (r) => r.replace(/```json|```/g, '').trim();
const processCoverLetterResponse = (r) => r.replace(/```html|```/g, '').trim();

const genAIWithRetry = async (prompt) => {
  return genAI(prompt);
};

export const processTailoredApplication = async (
  userId,
  applicationId,
  applicationData,
  io,
) => {
  try {
    const sanitized = applicationData;

    // ===== CV =====
    const cvPrompt = generateCVPrompt(
      sanitized.job.description,
      sanitized.candidate,
      sanitized.preferences,
    );

    const cvResponse = await genAIWithRetry(cvPrompt);
    const tailoredCV = processCVResponse(cvResponse);

    if (/<(style|html|head|body|script|link)|style\s*=/i.test(tailoredCV)) {
      throw new Error('Invalid CV HTML returned by AI');
    }

    // ===== COVER LETTER =====
    const clPrompt = generateCoverLetterPrompts(
      sanitized.job.title,
      sanitized.candidate,
      sanitized.preferences,
    );

    const clResponse = await genAIWithRetry(clPrompt);
    const tailoredCoverLetter = processCoverLetterResponse(clResponse);

    if (
      /<(style|html|head|body|script|link)|style\s*=/i.test(tailoredCoverLetter)
    ) {
      throw new Error('Invalid Cover Letter HTML returned by AI');
    }

    // ===== EMAIL =====
    const emailPrompt = generateEmailPrompt(sanitized);
    const emailResponse = await genAIWithRetry(emailPrompt);
    const applicationEmail = processEmailResponse(emailResponse);

    await Student.updateOne(
      { _id: userId, 'tailoredApplications._id': applicationId },
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
