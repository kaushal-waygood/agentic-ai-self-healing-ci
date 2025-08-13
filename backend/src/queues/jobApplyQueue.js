// // autopilot/jobApplyQueue.js
// import Queue from 'bull';
// import { Student } from '../models/student.model.js'; // Adjust path as per your project structure
// import { AppliedJob } from '../models/AppliedJob.js'; // Adjust path as per your project structure
// import {
//   sendJobApplicationEmail,
//   getRecruiterEmail,
// } from '../services/emailService.js'; // Adjust path
// import aiTaskQueue from './aiTaskQueue.js'; // Import the AI task queue

// // Initialize the Bull.js queue for job application tasks
// const jobApplyQueue = new Queue('job application', {
//   redis: {
//     host: process.env.REDIS_HOST || '127.0.0.1', // Use environment variable for Redis host
//     port: process.env.REDIS_PORT || 6379, // Use environment variable for Redis port
//   },
//   // Limiter ensures jobs are processed sequentially to avoid rate limits on email sending or APIs
//   limiter: {
//     max: 1, // Process a maximum of 1 job at a time
//     duration: 10000, // Wait 10 seconds between processing each job
//   },
// });

// /**
//  * Processes individual job application tasks.
//  * This worker performs the following steps sequentially for each job:
//  * 1. Fetches student data and their OAuth credentials.
//  * 2. Extracts the recruiter's email from the job data.
//  * 3. Enqueues an AI task to generate a cover letter and waits for its completion.
//  * 4. Sends the job application email using the generated cover letter.
//  * 5. Logs the successful application in the AppliedJob collection.
//  */
// jobApplyQueue.process(async (job) => {
//   console.log(
//     'Starting job application process for:',
//     job.data.jobData.job?.title,
//   );
//   const { studentId, jobData: jobData } = job.data;
//   console.log(
//     `[JobApplyQueue] Processing application for student ${studentId} to job: ${jobData.job.title}`,
//   );

//   try {
//     // 1. Fetch student data, including OAuth refresh token and name
//     const student = await Student.findById(studentId).select('fullName email ');

//     // 2. Extract the recruiter's email
//     // Assuming jobData.applyMethod.email is the direct email field
//     const recipientEmail =
//       jobData.applyMethod?.email || getRecruiterEmail(jobData);
//     if (!recipientEmail) {
//       console.error(
//         `[JobApplyQueue] No recipient email found for job: ${jobData.title} (Job ID: ${jobData._id}).`,
//       );
//       // If no email, this application cannot be sent. Throw error.
//       throw new Error('No recipient email found for job.');
//     }

//     // 3. Enqueue and wait for AI-generated cover letter
//     // Add a job to the 'ai tasks' queue, specifying the task type 'generate_cover_letter'
//     const aiJob = await aiTaskQueue.add('generate_cover_letter', {
//       jobData: jobData,
//       studentData: {
//         fullName: student.fullName,
//         email: student.email,
//         // Pass other relevant student data for AI context, like skills, experience
//         skills: student.skills, // Assuming student.skills exists and is relevant for CV/cover letter
//         experience: student.experience, // Assuming student.experience exists
//       },
//     });
//     // Wait for the AI task to complete and get the result (the generated cover letter)
//     const generatedCoverLetter = await aiJob.finished();
//     console.log(
//       `[JobApplyQueue] AI-generated cover letter received for job: ${jobData.title}.`,
//     );

//     // 4. Send the job application email
//     // Pass the AI-generated cover letter to the email service
//     await sendJobApplicationEmail(
//       jobData,
//       student,
//       recipientEmail,
//       generatedCoverLetter,
//     );

//     // 5. Log the successful application in the AppliedJob collection
//     await AppliedJob.create({
//       student: studentId,
//       job: jobData._id,
//       applicationDate: new Date(),
//       status: 'APPLIED', // Set status as 'APPLIED'
//       applicationMethod: 'AUTOPILOT', // Indicate it was sent by autopilot
//       // Optionally store links to generated content if they are persisted elsewhere
//       // coverLetterLink: 'url_to_generated_cover_letter.pdf',
//       // cvLink: 'url_to_generated_cv.pdf',
//     });
//     console.log(
//       `[JobApplyQueue] Successfully applied and logged for job ID: ${jobData._id}.`,
//     );
//   } catch (error) {
//     console.error(
//       `[JobApplyQueue] Error processing application for student ${studentId} to job ${jobData.title}:`,
//       error.message,
//     );
//     // Throwing the error here tells Bull.js that this job failed.
//     // Bull.js's 'attempts' and 'backoff' settings will handle retries.
//     throw error;
//   }
// });

// // --- Event Listeners for Queue Monitoring (Optional but highly recommended) ---
// // Add this to your jobApplyQueue initialization
// jobApplyQueue.on('waiting', (jobId) => {
//   console.log(`Job ${jobId} is waiting`);
// });

// jobApplyQueue.on('progress', (job, progress) => {
//   console.log(`Job ${job.id} is ${progress}% complete`);
// });

// jobApplyQueue.on('completed', (job) => {
//   console.log(
//     `[JobApplyQueue] Application task ${job.id} completed successfully.`,
//   );
// });

// jobApplyQueue.on('failed', (job, error) => {
//   console.error(
//     `[JobApplyQueue] Application task ${job.id} failed: ${error.message}.`,
//   );
//   // Log detailed error for debugging
//   console.error(error);
// });

// jobApplyQueue.on('active', (job) => {
//   console.log(
//     `[JobApplyQueue] Application task ${job.id} is active for job: ${job.data.jobData.title}.`,
//   );
// });

// jobApplyQueue.on('stalled', (jobId) => {
//   console.warn(
//     `[JobApplyQueue] Job ${jobId} stalled. This might indicate an issue with the worker.`,
//   );
// });

// jobApplyQueue.on('error', (error) => {
//   console.error(`[JobApplyQueue] Queue error: ${error.message}`);
// });

// export default jobApplyQueue;

import { sendJobApplicationEmail } from '../services/emailService.js';
import { Student } from '../models/student.model.js';
import { Job } from '../models/jobs.model.js';

// Example usage
const student = await Student.findById('student123').select('fullName email');
const job = await Job.findById('job456');

if (student && job) {
  const success = await sendJobApplicationEmail(
    job,
    student,
    'recruiter@company.com', // or job.applyMethod.email
  );

  if (success) {
    console.log('Application sent successfully!');
  } else {
    console.log('Failed to send application');
  }
}
