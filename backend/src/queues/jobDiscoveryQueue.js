import Queue from 'bull';
import { AppliedJob } from '../models/AppliedJob.js';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { buildEffectiveStudentProfile } from '../utils/profileHydration.js';
import aiTaskQueue from './aiTaskQueue.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';

console.log('🔍 [JobDiscoveryQueue] Worker started.');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
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
    // 2. Fetch the agent from StudentAgent collection.
    const agent = await StudentAgent.findOne({
      agentId,
      student: studentId,
      isAgentActive: true,
      status: 'completed',
    }).lean();
    if (!agent) {
      console.warn(
        `[JobDiscoveryQueue] Agent ${agentId} not found or inactive for student ${studentId}. Skipping.`,
      );
      return { skipped: true, reason: 'Agent not found or inactive' };
    }

    // 3. Fetch the complete student profile (Student + Education, Experience, Skills, Projects).
    const studentProfile = await getStudentProfileSnapshot(studentId);
    if (!studentProfile) {
      console.warn(
        `[JobDiscoveryQueue] Student ${studentId} not found. Skipping.`,
      );
      return { skipped: true, reason: 'Student not found' };
    }

    // 4. Build effective profile merging student + agent (e.g. agent's uploaded CV data).
    const effectiveProfile = buildEffectiveStudentProfile(studentProfile, agent);

    // 5. Extract configuration from agent.
    const applicationsToFind = agent.agentDailyLimit || 5;
    const agentConfig = {
      jobTitle: agent.jobTitle,
      country: agent.country,
      isRemote: agent.isRemote,
      employmentType: agent.employmentType,
    };

    // 5. Get all jobs this student has ever applied to, to avoid duplicates.
    const appliedJobIds = (
      await AppliedJob.find({ student: studentId }).distinct('job')
    ).map((id) => id.toString());

    // 6. Find recommended jobs using the fetched data.
    const recommendedJobs = await getRecommendedJobs({
      studentId,
      agentConfig,
      studentProfile: effectiveProfile,
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
          studentData: effectiveProfile,
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
