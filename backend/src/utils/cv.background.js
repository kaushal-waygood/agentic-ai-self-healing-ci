// src/utils/cv.background.js

import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { Student } from '../models/student.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';

export const processCVGeneration = async (
  userId,
  jobId,
  studentData,
  jobContextString,
  finalTouch,
  io,
) => {
  try {
    const prompt = generateCVPrompt(jobContextString, studentData, finalTouch);
    const rawJsonResponse = await genAI(prompt);
    const cleanedJsonString = rawJsonResponse
      .replace(/```json|```/g, '')
      .trim();
    const parsedJson = JSON.parse(cleanedJsonString);

    const updateResult = await Student.updateOne(
      {
        _id: userId,
        'cvs.jobId': jobId, // ✅ Add this filter for positional operator
      },
      {
        $set: {
          'cvs.$.status': 'completed',
          'cvs.$.cvData': parsedJson,
          'cvs.$.completedAt': new Date(),
          'cvs.$.jobContextString': jobContextString, // ✅ Fixed: 'cvs.$.' not 'cv.$.'
          'cvs.$.finalTouch': finalTouch, // ✅ Fixed: 'cvs.$.' not 'cv.$.'
        },
        $inc: { 'usageCounters.cvCreation': 1 },
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(`No CV found with jobId: ${jobId} for user: ${userId}`);
    }

    console.log('CV update successful:', updateResult);

    console.log(`CV generation successful for user: ${userId}, job: ${jobId}`);
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.CV_GENERATED_SUCCESS(
        'Your new CV is ready!',
        jobId,
      ),
    );
  } catch (error) {
    console.error(
      `CV generation failed for user: ${userId}, job: ${jobId}`,
      error,
    );
    const errorMessage =
      error.message || 'An unknown error occurred during generation.';

    await Student.updateOne(
      {
        _id: userId,
        'cvs.jobId': jobId, // ✅ Add this filter
      },
      {
        $set: {
          'cvs.$.status': 'failed',
          'cvs.$.error': errorMessage,
          'cvs.$.completedAt': new Date(),
        },
      },
    );

    // 3b. Send a failure notification
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.CV_GENERATED_FAILED(
        'CV generation failed.',
        errorMessage,
      ),
    );
  }
};
