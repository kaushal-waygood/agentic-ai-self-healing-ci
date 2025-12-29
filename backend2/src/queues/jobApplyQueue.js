import Queue from 'bull';
import mongoose from 'mongoose';
import { Student } from '../models/student.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
import { sendJobApplicationEmail } from '../services/emailService.js';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
};

const jobApplyQueue = new Queue('job application', {
  redis: redisConfig,
  settings: {
    stalledInterval: 60000,
    maxStalledCount: 1,
    lockDuration: 30000,
  },
  limiter: {
    // IMPORTANT: Rate limit to avoid being flagged as spam.
    // This allows max 6 applications per minute.
    max: 1,
    duration: 10000, // 1 job every 10 seconds
  },
});

jobApplyQueue.process(async (job) => {
  // OPTIMIZATION: Receive enriched data directly from the previous queue.
  const { studentId, agentId, jobData, studentData, coverLetter } = job.data;

  console.log(
    `📨 [JobApplyQueue] Processing application for agent ${agentId}: Student ${studentId} to job "${jobData.job?.title}"`,
  );

  try {
    const jobId = jobData.job._id;

    // --- 1. Idempotency Check ---
    // OPTIMIZATION: Prevent duplicate applications if a job is ever re-run.
    const alreadyApplied = await AppliedJob.exists({
      student: studentId,
      job: jobId,
    });
    if (alreadyApplied) {
      console.log(
        `[JobApplyQueue] Application already exists for job ${jobId}. Skipping.`,
      );
      return { skipped: true, reason: 'Already applied' };
    }

    // --- 2. Check if Autopilot is still enabled ---
    // This check remains important as a final safeguard.
    const student = await Student.findById(studentId)
      .select('autopilotAgent')
      .lean();
    const agent = student?.autopilotAgent?.find((a) => a.agentId === agentId);

    if (!agent || !agent.autopilotEnabled) {
      console.log(
        `[JobApplyQueue] Autopilot disabled for agent ${agentId}. Skipping application.`,
      );
      return { skipped: true, reason: 'Autopilot disabled' };
    }

    // --- 3. Send the Application Email ---
    // We use the studentData from the job payload, avoiding another DB call.
    const emailResult = await sendJobApplicationEmail({
      jobData,
      student: studentData,
      coverLetter, // Pass the AI-generated cover letter to the email service
      recipientEmail:
        jobData.job.applyMethod?.email || process.env.DEFAULT_RECIPIENT_EMAIL,
    });

    if (emailResult.rejected?.length > 0) {
      throw new Error(
        `Email rejected by recipient server: ${emailResult.rejected.join(
          ', ',
        )}`,
      );
    }

    // --- 4. Record the Successful Application ---
    await AppliedJob.create({
      student: studentId,
      job: jobId,
      applicationDate: new Date(),
      status: 'APPLIED',
      applicationMethod: 'AUTOPILOT',
      jobTitle: jobData.job.title,
      company: jobData.job.company,
      source: jobData.source || 'ZobsAI',
      // OPTIMIZATION: Add agentId for better tracking and analytics.
      agentData: {
        agentId,
      },
      emailConfirmation: {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
        timestamp: new Date(),
      },
    });

    console.log(
      `✅ [JobApplyQueue] Successfully applied to ${jobData.job.title} for agent ${agentId}`,
    );
    return { success: true };
  } catch (error) {
    console.error(
      `❌ [JobApplyQueue] Error processing application for agent ${agentId}:`,
      error.message,
    );
    throw error;
  }
});

// --- Event Listeners for Queue Monitoring ---
jobApplyQueue.on('completed', (job, result) => {
  if (result?.skipped) {
    console.log(`[JobApplyQueue] Job ${job.id} skipped: ${result.reason}`);
  } else {
    console.log(`[JobApplyQueue] Job ${job.id} completed successfully`);
  }
});

jobApplyQueue.on('failed', (job, err) => {
  console.error(
    `[JobApplyQueue] Job ${job.id} for agent ${job.data.agentId} FAILED:`,
    err.message,
  );
});

export default jobApplyQueue;
