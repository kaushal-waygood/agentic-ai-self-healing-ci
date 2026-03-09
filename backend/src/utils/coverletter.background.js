import { generateContent } from '../config/gemini.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
import { StudentCL } from '../models/students/studentCL.model.js'; // NEW MODEL
import { User } from '../models/User.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { wrapCoverLetterHtml } from './coverletterTemplate.js';
import redisClient from '../config/redis.js';

export const processCoverLetterGeneration = async (
  userId,
  jobId,
  studentData,
  jobContextString,
  finalTouch,
  io,
) => {
  let clId = null;

  try {
    // 1. Fetch from StudentCL collection
    const clDoc = await StudentCL.findOne({ student: userId, jobId: jobId });

    if (!clDoc) {
      throw new Error(
        `No StudentCL found with jobId: ${jobId} for user: ${userId}`,
      );
    }

    clId = clDoc._id;

    // 2. Parse Student Data
    let parsed = {};
    if (typeof studentData === 'string') {
      try {
        parsed = JSON.parse(studentData);
      } catch (e) {
        console.warn('Failed to parse studentData string', e);
        parsed = {};
      }
    } else if (typeof studentData === 'object' && studentData !== null) {
      parsed = studentData;
    }

    // 3. Prepare Prompt Data
    let studentProfile = {};
    if (parsed && typeof parsed === 'object') {
      if (parsed.profile && typeof parsed.profile === 'object') {
        studentProfile = { ...parsed.profile };
        if (parsed.resumeText) studentProfile.resumeText = parsed.resumeText;
      } else {
        studentProfile = { ...parsed };
      }
    }

    // Ensure array fields exist
    ['education', 'experience', 'skills', 'projects'].forEach((field) => {
      studentProfile[field] = Array.isArray(studentProfile[field])
        ? studentProfile[field]
        : [];
    });
    studentProfile.fullName = studentProfile.fullName || '';
    studentProfile.email = studentProfile.email || '';
    studentProfile.phone = studentProfile.phone || '';
    studentProfile.resumeText =
      studentProfile.resumeText || parsed.resumeText || '';

    // 4. Generate AI Content
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

    // Security check
    if (/<(style|html|head|body|script|link)|style\s*=/i.test(cleaned)) {
      throw new Error('Invalid Cover Letter HTML: forbidden tags detected');
    }

    const htmlContent = wrapCoverLetterHtml(cleaned, 'Cover Letter');

    // 5. Update StudentCL (Success)
    const updateResult = await StudentCL.findByIdAndUpdate(clId, {
      $set: {
        status: 'completed',
        clData: { html: htmlContent },
        completedAt: new Date(),
        jobContextString: jobContextString, // Update context if needed
        finalTouch: finalTouch,
      },
    });

    if (!updateResult) {
      throw new Error(`Failed to update StudentCL with ID: ${clId}`);
    }

    // 6. Increment Usage
    try {
      await User.updateOne(
        { _id: userId },
        { $inc: { 'usageCounters.coverLetter': 1 } },
      );
    } catch (incErr) {
      console.error(`Failed to increment usage for user ${userId}:`, incErr);
    }

    await redisClient.del(`dashboard:${userId}:ai-activity`);

    // 7. Send Notification
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
      `CL generation failed for user: ${userId}, job: ${jobId}`,
      error,
    );

    // Error Handling Logic
    let errorMessage = 'An unknown error occurred.';
    let userFriendlyMessage = 'Sorry, we encountered an issue.';

    if (error?.status === 503 || error?.message?.includes('overload')) {
      userFriendlyMessage = 'AI service overloaded. Please try again later.';
    } else if (error?.status === 429) {
      userFriendlyMessage = 'Too many requests. Please wait a moment.';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Update StudentCL (Failure)
    if (clId || userId) {
      const filter = clId ? { _id: clId } : { student: userId, jobId: jobId };
      try {
        await StudentCL.updateOne(filter, {
          $set: {
            status: 'failed',
            error: errorMessage,
            completedAt: new Date(),
          },
        });
      } catch (e) {
        console.error('Failed to update failure state in DB:', e);
      }
    }

    // Notification
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
