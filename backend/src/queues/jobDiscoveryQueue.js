import Queue from 'bull';
import { AppliedJob } from '../models/AppliedJob.js';
import { Student } from '../models/student.model.js';
import { calculateMatchScore } from '../utils/jobUtils.js';
import aiTaskQueue from './aiTaskQueue.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';

console.log('🔍 [JobDiscoveryQueue] Worker started.');

const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  redis: {
    connectTimeout: 30000,
  },
};

const jobDiscoveryQueue = new Queue('job discovery', {
  redis: redisConfig,
  limiter: {
    max: 10,
    duration: 1000,
  },
});

jobDiscoveryQueue.client.on('connect', () => {
  console.log(
    `[Queue Worker] Redis client connected for process ${process.pid}`,
  );
});

jobDiscoveryQueue.client.on('error', (err) => {
  console.error(
    `[Queue Worker] Redis client connection error for process ${process.pid}:`,
    err,
  );
});

jobDiscoveryQueue.client.on('ready', () => {
  console.log(
    `[Queue Worker] Redis client is ready for process ${process.pid}`,
  );
});

jobDiscoveryQueue.process(async (job) => {
  // 1. Destructure only the IDs and names sent by the producer.
  const { studentId, agentId, agentName } = job.data;
  console.log(
    `🔍 [JobDiscoveryQueue] Processing trigger for agent "${agentName}" (${agentId})`,
  );

  try {
    // 2. Fetch the complete, up-to-date student profile.
    const studentProfile = await Student.findById(studentId).lean();
    if (!studentProfile) {
      console.warn(
        `[JobDiscoveryQueue] Student ${studentId} not found. Skipping.`,
      );
      return { skipped: true, reason: 'Student not found' };
    }

    // 3. Find the specific agent's configuration within the student's profile.
    const agent = studentProfile.autopilotAgent?.find(
      (a) => a.agentId === agentId,
    );
    if (!agent) {
      console.warn(
        `[JobDiscoveryQueue] Agent ${agentId} not found for student ${studentId}. Skipping.`,
      );
      return { skipped: true, reason: 'Agent not found' };
    }

    // 4. Extract the necessary configuration from the fetched agent data.
    const applicationsToFind = agent.dailyApplicationLimit || 5;
    const agentConfig = agent.filters || {};

    // 5. Get all jobs this student has ever applied to, to avoid duplicates.
    const appliedJobIds = (
      await AppliedJob.find({ student: studentId }).distinct('job')
    ).map((id) => id.toString());

    // 6. Find recommended jobs using the fetched data.
    const recommendedJobs = await getRecommendedJobs({
      studentId,
      agentConfig,
      studentProfile,
      appliedJobIds,
    });

    if (recommendedJobs.length === 0) {
      console.log(
        `[JobDiscoveryQueue] No new unique jobs found for agent ${agentId}.`,
      );
      return { skipped: true, reason: 'No new unique jobs found' };
    }

    // 7. Score the jobs and take the top N best matches.
    const jobsToProcess = recommendedJobs.slice(0, applicationsToFind);

    // 8. Prepare and queue the chosen jobs for the next stage (AI processing).
    const aiTasks = jobsToProcess.map(({ job, score }) => {
      console.log(
        `[JobDiscoveryQueue] Queuing job "${job.title}" (Score: ${
          score?.toFixed(2) || 'N/A'
        }) for AI processing.`,
      );
      const plainJobObject = JSON.parse(JSON.stringify(job));
      return {
        name: 'generate_cover_letter',
        data: {
          studentId,
          agentId,
          jobData: { job: plainJobObject },
          studentData: studentProfile,
        },
        opts: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      };
    });

    if (aiTasks.length > 0) {
      await aiTaskQueue.addBulk(aiTasks);
    }

    console.log(
      `✅ [JobDiscoveryQueue] Passed ${aiTasks.length} jobs to the AI queue for agent ${agentId}.`,
    );
    return { success: true, applicationsQueuedForAI: aiTasks.length };
  } catch (error) {
    console.error(
      `❌ [JobDiscoveryQueue] Error during discovery for agent ${agentId}:`,
      error,
    );
    throw error; // Re-throw the error to let Bull mark the job as failed.
  }
});

// --- Event Listeners for Queue Monitoring ---
jobDiscoveryQueue.on('completed', (job, result) => {
  const agentName = job.data.agentName || job.data.agentId;
  if (result?.skipped) {
    console.log(
      `[JobDiscoveryQueue] Job for agent "${agentName}" skipped: ${result.reason}`,
    );
  } else {
    console.log(`[JobDiscoveryQueue] Job for agent "${agentName}" completed.`);
  }
});

jobDiscoveryQueue.on('failed', (job, err) => {
  const agentName = job.data.agentName || job.data.agentId;
  console.error(
    `[JobDiscoveryQueue] Job for agent "${agentName}" FAILED: ${err.message}`,
  );
});

export default jobDiscoveryQueue;
