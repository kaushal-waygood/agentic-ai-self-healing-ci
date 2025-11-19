// src/utils/coverletter.background.js

import { generateContent } from '../config/gemini.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
import { Student } from '../models/student.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { convertToStyledHtml } from './coverletter.htmlify.js';
import { User } from '../models/User.model.js';

export const processCoverLetterGeneration = async (
  userId,
  jobId,
  studentData,
  jobContextString,
  finalTouch,
  io,
) => {
  let clId;

  try {
    const student = await Student.findOne(
      { _id: userId, 'cls.jobId': jobId },
      { 'cls.$': 1 },
    );

    if (!student || !student.cls || student.cls.length === 0) {
      throw new Error(
        `No cover letter found with jobId: ${jobId} for user: ${userId}`,
      );
    }

    clId = student.cls[0]._id;
    let parsed = {};
    if (typeof studentData === 'string') {
      try {
        parsed = JSON.parse(studentData);
      } catch (e) {
        console.warn(
          'processCoverLetterGeneration: failed to parse studentData string',
          e,
        );
        parsed = {};
      }
    } else if (typeof studentData === 'object' && studentData !== null) {
      parsed = studentData;
    }

    let studentProfile = {};
    if (parsed && typeof parsed === 'object') {
      if (parsed.profile && typeof parsed.profile === 'object') {
        studentProfile = { ...parsed.profile };
        if (parsed.resumeText) {
          studentProfile.resumeText = parsed.resumeText;
        }
      } else {
        studentProfile = { ...parsed };
      }
    }

    studentProfile.fullName = studentProfile.fullName || '';
    studentProfile.email = studentProfile.email || '';
    studentProfile.phone = studentProfile.phone || '';
    studentProfile.education = Array.isArray(studentProfile.education)
      ? studentProfile.education
      : studentProfile.education
      ? studentProfile.education
      : [];
    studentProfile.experience = Array.isArray(studentProfile.experience)
      ? studentProfile.experience
      : studentProfile.experience
      ? studentProfile.experience
      : [];
    studentProfile.skills = Array.isArray(studentProfile.skills)
      ? studentProfile.skills
      : studentProfile.skills
      ? studentProfile.skills
      : [];
    studentProfile.projects = Array.isArray(studentProfile.projects)
      ? studentProfile.projects
      : studentProfile.projects
      ? studentProfile.projects
      : [];
    // resumeText fallback
    studentProfile.resumeText =
      studentProfile.resumeText || parsed.resumeText || '';

    const prompt = generateCoverLetterPrompts(
      jobContextString,
      JSON.stringify(studentProfile),
      finalTouch,
    );

    const rawResponse = await generateContent(prompt);
    const rawStr =
      typeof rawResponse === 'string' ? rawResponse : String(rawResponse || '');

    const cleaned = rawStr
      .replace(/```(?:html)?/g, '')
      .replace(/```/g, '')
      .trim();

    const profileForHtml = (() => {
      try {
        if (parsed && parsed.profile && typeof parsed.profile === 'object') {
          return { ...parsed.profile };
        }
        return parsed || {};
      } catch (e) {
        return {};
      }
    })();

    const htmlContent = convertToStyledHtml(cleaned, profileForHtml, {
      themeColor: '#0f172a',
      accent: '#2563eb',
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
    });

    const updateResult = await Student.updateOne(
      { 'cls._id': clId },
      {
        $set: {
          'cls.$.status': 'completed',
          'cls.$.clData': { html: htmlContent },
          'cls.$.completedAt': new Date(),
          'cls.$.jobContextString': jobContextString,
          'cls.$.finalTouch': finalTouch,
        },
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(
        `Failed to update cover letter with clId: ${clId} (match count 0)`,
      );
    }

    try {
      await User.updateOne(
        { _id: userId },
        { $inc: { 'usageCounters.coverLetter': 1 } },
      );
    } catch (incErr) {
      console.error(
        `Failed to increment coverLetterCreation for user ${userId}:`,
        incErr,
      );
    }

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.COVER_LETTER_GENERATED_SUCCESS(
        'Your new cover letter is ready!',
        clId,
      ),
    );
  } catch (error) {
    console.error(
      `Cover letter generation failed for user: ${userId}, job: ${jobId}`,
      error,
    );

    // Enhanced error handling with user-friendly messages
    let errorMessage = 'An unknown error occurred during generation.';
    let userFriendlyMessage =
      'Sorry, we encountered an issue generating your cover letter.';

    if (error?.status === 503) {
      errorMessage =
        'AI service is temporarily overloaded. Please try again in a few moments.';
      userFriendlyMessage =
        'The AI service is currently busy. Please try again in a few minutes.';
    } else if (error?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      userFriendlyMessage =
        "We're processing too many requests. Please wait a moment and try again.";
    } else if (error?.status === 401) {
      errorMessage = 'Invalid API key or authentication failed.';
      userFriendlyMessage =
        'Service configuration issue. Please contact support.';
    } else if (error?.status === 400) {
      errorMessage = 'Bad request - invalid prompt or parameters.';
      userFriendlyMessage =
        'There was an issue with the generation request. Please try again.';
    } else if (error?.message) {
      errorMessage = error.message;

      // Extract user-friendly message from specific error types
      if (
        error.message.includes('overloaded') ||
        error.message.includes('overload')
      ) {
        userFriendlyMessage =
          'The AI service is currently overloaded. Please try again in a few minutes.';
      } else if (
        error.message.includes('quota') ||
        error.message.includes('limit')
      ) {
        userFriendlyMessage = 'Service limit reached. Please try again later.';
      }
    }

    const failureFilter = clId
      ? { 'cls._id': clId }
      : { _id: userId, 'cls.jobId': jobId };

    // Update with failed status
    try {
      await Student.updateOne(failureFilter, {
        $set: {
          'cls.$.status': 'failed',
          'cls.$.error': errorMessage,
          'cls.$.completedAt': new Date(),
        },
      });
    } catch (e) {
      console.error('Failed to mark cover letter job as failed in DB:', e);
    }

    // Send a failure notification
    try {
      await sendRealTimeUserNotification(
        io,
        userId,
        notificationTemplates.COVER_LETTER_GENERATED_FAILED(
          userFriendlyMessage,
          errorMessage,
        ),
      );
    } catch (notifyErr) {
      console.error('Failed to send failure notification:', notifyErr);
    }
  }
};
