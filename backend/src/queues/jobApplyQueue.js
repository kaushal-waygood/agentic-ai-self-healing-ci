// autopilot/jobApplyQueue.js
import Queue from 'bull';
import { Student } from '../models/student.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
import { sendJobApplicationEmail } from '../services/emailService.js';
import mongoose from 'mongoose';

const jobApplyQueue = new Queue('job application', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  settings: {
    stalledInterval: 60000,
    maxStalledCount: 1,
    lockDuration: 30000,
  },
  limiter: {
    max: 1,
    duration: 10000,
  },
});

jobApplyQueue.process(async (job) => {
  const { studentId, jobData } = job.data;
  console.log(
    `Processing application for student ${studentId} to job: ${jobData.job?.title}`,
  );

  try {
    // 1. First check if autopilot is still enabled
    const student = await Student.findById(studentId).select(
      'settings.autopilotEnabled',
    );
    if (!student) {
      throw new Error(`Student not found with ID: ${studentId}`);
    }

    if (!student.settings.autopilotEnabled) {
      console.log(
        `Autopilot disabled - skipping application for student ${studentId}`,
      );
      return { skipped: true, reason: 'Autopilot disabled' };
    }

    // 2. Validate job data
    if (!jobData?.job || typeof jobData.job !== 'object') {
      throw new Error('Invalid job data: missing job object');
    }

    const requiredFields = ['title', 'company', 'description'];
    const missingFields = requiredFields.filter((field) => !jobData.job[field]);
    if (missingFields.length > 0) {
      throw new Error(
        `Missing required job fields: ${missingFields.join(', ')}`,
      );
    }

    // 3. Generate MongoDB ObjectId if needed
    if (!mongoose.Types.ObjectId.isValid(jobData.job._id)) {
      jobData.job._id = new mongoose.Types.ObjectId();
    }

    // 4. Get full student data
    const fullStudent = await Student.findById(studentId).select(
      'fullName email skills experience',
    );

    // 5. Send application email
    const recipientEmail =
      process.env.DEFAULT_RECIPIENT_EMAIL || 'careers@example.com';
    const emailResult = await sendJobApplicationEmail({
      jobData,
      student: fullStudent,
      recipientEmail: 'shariq@helpstudyabroad.com',
      // recipientEmail: 'arsalan@helpstudyabroad.com',
    });

    if (emailResult.rejected?.length > 0) {
      throw new Error(
        `Email rejected by recipient server: ${emailResult.rejected.join(
          ', ',
        )}`,
      );
    }

    // 6. Record application
    await AppliedJob.create({
      student: studentId,
      job: jobData.job._id,
      applicationDate: new Date(),
      status: 'APPLIED',
      applicationMethod: 'AUTOPILOT',
      jobTitle: jobData.job.title,
      company: jobData.job.company,
      source: jobData.source || 'external',
      emailConfirmation: {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
        timestamp: new Date(),
      },
    });

    console.log(
      `Successfully applied to ${jobData.job.title} at ${jobData.job.company}`,
    );
    return { success: true };
  } catch (error) {
    console.error(
      `Error processing application for student ${studentId}:`,
      error.message,
    );
    throw error;
  }
});

// Enhanced event listeners with better logging
jobApplyQueue.on('completed', (job, result) => {
  if (result?.skipped) {
    console.log(`Job ${job.id} skipped: ${result.reason}`);
  } else {
    console.log(`Job ${job.id} completed successfully`);
  }
});

jobApplyQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err.message);
  if (job) {
    console.error(
      'Job data:',
      JSON.stringify(
        {
          studentId: job.data.studentId,
          jobTitle: job.data.jobData?.job?.title,
        },
        null,
        2,
      ),
    );
  }
});

// Cleanup jobs
// const cleanQueue = async () => {
//   try {
//     await jobApplyQueue.clean(7 * 24 * 60 * 60 * 1000, 'completed');
//     await jobApplyQueue.clean(14 * 24 * 60 * 60 * 1000, 'failed');
//     console.log('Queue cleanup completed');
//   } catch (err) {
//     console.error('Queue cleanup failed:', err);
//   }
// };

// Run cleanup daily
// setInterval(cleanQueue, 24 * 60 * 60 * 1000);
// cleanQueue(); // Initial cleanup

export default jobApplyQueue;
