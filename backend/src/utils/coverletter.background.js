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
  let clId; // This will store the cover letter's unique _id

  try {
    // 1. Find the student and the specific cover letter sub-document
    const student = await Student.findOne(
      { _id: userId, 'cls.jobId': jobId },
      { 'cls.$': 1 }, // Project only the matching cover letter from the array
    );

    if (!student || !student.cls || student.cls.length === 0) {
      throw new Error(
        `No cover letter found with jobId: ${jobId} for user: ${userId}`,
      );
    }

    // 2. Get the unique _id (clId) of the cover letter sub-document
    clId = student.cls[0]._id;

    // 3. Generate the Cover Letter from the AI
    const prompt = generateCoverLetterPrompts(
      jobContextString,
      studentData,
      finalTouch,
    );
    const rawHtmlResponse = await genAI(prompt);
    const htmlContent = rawHtmlResponse.replace(/```html|```/g, '').trim();

    console.log('htmlContent:', htmlContent);

    // 4. Update the Cover Letter using its unique clId
    const updateResult = await Student.updateOne(
      { 'cls._id': clId }, // Use the unique sub-document _id for the update
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
        `Failed to update cover letter with clId: ${clId} (match count 0)`,
      );
    }

    // 5. Send success notification with the clId
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.COVER_LETTER_GENERATED_SUCCESS(
        'Your new cover letter is ready!',
        clId, // <-- Now sending clId
      ),
    );
  } catch (error) {
    console.error(
      `Cover letter generation failed for user: ${userId}, job: ${jobId}`,
      error,
    );
    const errorMessage =
      error.message || 'An unknown error occurred during generation.';

    // Determine the filter for the failure update.
    // If we got the clId before the error, use it. Otherwise, fall back to jobId.
    const failureFilter = clId
      ? { 'cls._id': clId }
      : { _id: userId, 'cls.jobId': jobId };

    // Update with failed status
    await Student.updateOne(failureFilter, {
      $set: {
        'cls.$.status': 'failed',
        'cls.$.error': errorMessage,
        'cls.$.completedAt': new Date(),
      },
    });

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
