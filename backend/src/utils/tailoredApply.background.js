// src/utils/tailoredApply.background.js

import { genAI } from '../config/gemini.js';
// import { generateCVPrompts } from '../prompt/generateCVPrompt.js';
// import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
// import { generateEmailPrompt } from '../prompt/generateEmailPrompt.js';

import {
  generateCVPrompts,
  generateCoverLetterPrompts,
  generateEmailPrompt,
} from './generateTailored.js';

import { Student } from '../models/student.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';

// Helper functions to process AI responses
const processCVResponse = (response) => {
  return response.replace(/```json|```/g, '').trim();
};

const processCoverLetterResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};

const processEmailResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};

// Retry mechanism for AI calls
const genAIWithRetry = async (prompt, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await genAI(prompt);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`AI call failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const processTailoredApplication = async (
  userId,
  applicationId,
  applicationData,
  io,
) => {
  try {
    console.log(
      `Starting tailored application generation for user: ${userId}, application: ${applicationId}`,
    );

    // Step 1: Generate all components sequentially
    console.log('Step 1: Generating tailored CV...');
    const cvResponse = await genAIWithRetry(generateCVPrompts(applicationData));
    const tailoredCV = processCVResponse(cvResponse);

    console.log('Step 2: Generating tailored Cover Letter...');
    const coverLetterResponse = await genAIWithRetry(
      generateCoverLetterPrompts(applicationData),
    );
    const tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);

    console.log('Step 3: Generating application Email...');
    const emailResponse = await genAIWithRetry(
      generateEmailPrompt(applicationData),
    );
    const applicationEmail = processEmailResponse(emailResponse);

    // Step 2: Update the application with generated data
    const updateResult = await Student.updateOne(
      {
        _id: userId,
        'tailoredApplications._id': applicationId,
      },
      {
        $set: {
          'tailoredApplications.$.status': 'completed',
          'tailoredApplications.$.tailoredCV': tailoredCV,
          'tailoredApplications.$.tailoredCoverLetter': tailoredCoverLetter,
          'tailoredApplications.$.applicationEmail': applicationEmail,
          'tailoredApplications.$.completedAt': new Date(),
        },
        $inc: { 'usageCounters.tailoredApplications': 1 },
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(
        `No application found with ID: ${applicationId} for user: ${userId}`,
      );
    }

    console.log('Tailored application update successful:', updateResult);

    // Step 3: Send success notification
    console.log(
      `Tailored application generation successful for user: ${userId}, application: ${applicationId}`,
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
    console.error(
      `Tailored application generation failed for user: ${userId}, application: ${applicationId}`,
      error,
    );
    const errorMessage =
      error.message || 'An unknown error occurred during generation.';

    // Update with failed status
    await Student.updateOne(
      {
        _id: userId,
        'tailoredApplications._id': applicationId,
      },
      {
        $set: {
          'tailoredApplications.$.status': 'failed',
          'tailoredApplications.$.error': errorMessage,
          'tailoredApplications.$.completedAt': new Date(),
        },
      },
    );

    // Send failure notification
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_FAILED(
        'Tailored application generation failed.',
        errorMessage,
      ),
    );
  }
};
