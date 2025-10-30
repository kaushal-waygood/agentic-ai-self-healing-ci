// src/utils/coverletter.background.js

import { genAI } from '../config/gemini.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
import { Student } from '../models/student.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';

export const processCoverLetterGeneration = async (
  userId,
  jobId,
  studentData,
  jobContextString,
  finalTouch,
  io,
) => {
  try {
    // 1. Generate the Cover Letter from the AI
    const prompt = generateCoverLetterPrompts(
      jobContextString,
      studentData,
      finalTouch,
    );
    const rawHtmlResponse = await genAI(prompt);
    const htmlContent = rawHtmlResponse.replace(/```html|```/g, '').trim();

    // 2. Update the Cover Letter with the generated data
    const updateResult = await Student.updateOne(
      {
        _id: userId,
        'cls.jobId': jobId, // Filter for the specific cover letter entry
      },
      {
        $set: {
          'cls.$.status': 'completed',
          'cls.$.clData': { html: htmlContent },
          'cls.$.completedAt': new Date(),
          'cls.$.jobContextString': jobContextString,
          'cls.$.finalTouch': finalTouch,
        },
        $inc: { 'usageCounters.coverLetterCreation': 1 },
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(
        `No cover letter found with jobId: ${jobId} for user: ${userId}`,
      );
    }

    console.log('Cover letter update successful:', updateResult);

    // 3. Send a success notification
    console.log(
      `Cover letter generation successful for user: ${userId}, job: ${jobId}`,
    );
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.COVER_LETTER_GENERATED_SUCCESS(
        'Your new cover letter is ready!',
        jobId,
      ),
    );
  } catch (error) {
    console.error(
      `Cover letter generation failed for user: ${userId}, job: ${jobId}`,
      error,
    );
    const errorMessage =
      error.message || 'An unknown error occurred during generation.';

    // Update with failed status
    await Student.updateOne(
      {
        _id: userId,
        'cls.jobId': jobId,
      },
      {
        $set: {
          'cls.$.status': 'failed',
          'cls.$.error': errorMessage,
          'cls.$.completedAt': new Date(),
        },
      },
    );

    // Send a failure notification
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.COVER_LETTER_GENERATED_FAILED(
        'Cover letter generation failed.',
        errorMessage,
      ),
    );
  }
};
