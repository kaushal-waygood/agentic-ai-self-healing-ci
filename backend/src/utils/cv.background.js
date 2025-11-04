// src/utils/cv.background.js

import mongoose from 'mongoose';
// import { User } from '../models/User.model.js'; // This import wasn't used
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
  let cvId; // This will store the CV's unique _id
  let jobTitle; // This will store the job title for notifications

  try {
    // 1. Find the student and the specific CV sub-document
    const student = await Student.findOne(
      { _id: userId, 'cvs.jobId': jobId },
      { 'cvs.$': 1 }, // Project only the matching CV from the array
    );

    if (!student || !student.cvs || !student.cvs.length) {
      throw new Error(`No CV found with jobId: ${jobId} for user: ${userId}`);
    }

    // 2. Get the unique _id (cvId) and jobTitle of the CV sub-document
    const cvSubDoc = student.cvs[0];
    cvId = cvSubDoc._id;
    jobTitle = cvSubDoc.jobTitle || 'your recent job';

    // 3. Generate the CV content from the AI
    const prompt = generateCVPrompt(jobContextString, studentData, finalTouch);
    const rawJsonResponse = await genAI(prompt);
    const cleanedJsonString = rawJsonResponse
      .replace(/```json|```/g, '')
      .trim();
    const parsedJson = JSON.parse(cleanedJsonString);
    const atsScore = parsedJson.atsScore || 0;

    // 4. Update the CV
    const updateResult = await Student.updateOne(
      { 'cvs._id': cvId },
      {
        $set: {
          'cvs.$.status': 'completed',
          'cvs.$.cvData': parsedJson, // The full JSON response
          'cvs.$.atsScore': atsScore,
          'cvs.$.completedAt': new Date(),
          'cvs.$.jobContextString': jobContextString,
          'cvs.$.finalTouch': finalTouch,
        },
        $inc: { 'usageCounters.cvCreation': 1 },
      },
    );

    console.log('updateResult', updateResult);

    if (updateResult.matchedCount === 0) {
      throw new Error(`Failed to update CV with cvId: ${cvId} (match count 0)`);
    }

    // 5. Send success notification with jobTitle and cvId
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.CV_GENERATED_SUCCESS(jobTitle, cvId, atsScore),
    );
  } catch (error) {
    console.error(
      `CV generation failed for user: ${userId}, job: ${jobId}`,
      error,
    );
    const errorMessage =
      error.message || 'An unknown error occurred during generation.';

    // Determine the filter for the failure update.
    const failureFilter = cvId
      ? { 'cvs._id': cvId }
      : { _id: userId, 'cvs.jobId': jobId };

    // 6. Update with failed status
    await Student.updateOne(failureFilter, {
      $set: {
        'cvs.$.status': 'failed',
        'cvs.$.error': errorMessage,
        'cvs.$.completedAt': new Date(),
      },
    });

    // 7. Send a failure notification
    const titleForFailure = jobTitle || 'your recent CV';
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.CV_GENERATED_FAILED(titleForFailure),
    );
  }
};
