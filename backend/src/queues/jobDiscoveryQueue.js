// autopilot/jobDiscoveryQueue.js
import Queue from 'bull';
import { Student } from '../models/student.model.js';
import { Job } from '../models/jobs.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
import jobApplyQueue from './jobApplyQueue.js';
import {
  calculateMatchScore,
  convertSalaryToYearly,
} from '../utils/jobUtils.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';

// Initialize queue (in-memory for development)
const jobDiscoveryQueue = new Queue('job discovery', {
  redis:
    process.env.NODE_ENV === 'production'
      ? {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: process.env.REDIS_PORT || 6379,
        }
      : undefined,
});

/**
 * Processes job discovery tasks by querying MongoDB directly
 */
jobDiscoveryQueue.process(async (job) => {
  const { studentId } = job.data;
  console.log(`Discovering jobs for student ${studentId}...`);

  try {
    // Execute query
    const jobs = await getRecommendedJobs(studentId);
    console.log(`Found ${jobs.length} potential jobs`);

    if (jobs.length === 0) {
      console.log('No jobs matched the criteria');
      return;
    }

    const student = await Student.findById(studentId);
    const preferences = student.jobPreferences;

    // Calculate match scores and sort
    const scoredJobs = jobs
      .map((job) => ({
        job,
        score: calculateMatchScore(job, preferences),
      }))
      .sort((a, b) => b.score - a.score);

    // Process recommended jobs
    for (const { job, score } of scoredJobs) {
      console.log('job');
      await jobApplyQueue.add(
        {
          studentId,
          jobData: job,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          timeout: 5 * 60 * 1000,
        },
      );
      console.log(`Added job "${job.title}" (Score: ${score.toFixed(2)})`);
    }
  } catch (error) {
    console.error(
      `Error processing job discovery for student ${studentId}:`,
      error,
    );
    throw error;
  }
});

// Event listeners
jobDiscoveryQueue.on('completed', (job) => {
  console.log(`Job discovery task ${job.id} completed`);
});

jobDiscoveryQueue.on('failed', (job, err) => {
  console.error(`Job discovery task ${job.id} failed:`, err.message);
});

jobDiscoveryQueue.on('active', (job) => {
  console.log(`Job discovery task ${job.id} is active`);
});

export default jobDiscoveryQueue;
