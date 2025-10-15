// autopilot/jobDiscoveryQueue.js
import Queue from 'bull';
import { Student } from '../models/student.model.js';
import { Job } from '../models/jobs.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
import jobApplyQueue from './jobApplyQueue.js';
import { calculateMatchScore } from '../utils/jobUtils.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';
import { sendJobApplicationEmail } from '../services/emailService.js';

const jobDiscoveryQueue = new Queue('job discovery', {
  redis:
    process.env.NODE_ENV === 'production'
      ? {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: process.env.REDIS_PORT || 6379,
        }
      : undefined,
  limiter: {
    max: 10,
    duration: 1000,
  },
});

// jobDiscoveryQueue.process(async (job) => {
//   const { studentId, agentId, agentConfig, studentProfile } = job.data;

//   try {
//     const student = await Student.findById(studentId).lean();
//     // console.log('student', student);
//     if (!student) {
//       console.log(`Student ${studentId} not found`);
//       return { skipped: true, reason: 'Student not found' };
//     }

//     if (!student.autopilotAgent || !Array.isArray(student.autopilotAgent)) {
//       console.log(`Student ${studentId} has no autopilotAgent array defined.`);
//       return { skipped: true, reason: 'Student has no autopilot agents' };
//     }

//     const jobsInApplyQueue = await jobApplyQueue.getJobs([
//       'waiting',
//       'active',
//       'delayed',
//     ]);

//     const recentlyQueuedJobIds = jobsInApplyQueue
//       .map((j) =>
//         j && j.data && j.data.jobData?.job?._id ? j.data.jobData.job._id : null,
//       )
//       .filter((id) => id);

//     const agent = student.autopilotAgent.find((a) => a.agentId === agentId);
//     if (!agent || !agent.autopilotEnabled) {
//       console.log(`Agent ${agentId} not found or disabled`);
//       return { skipped: true, reason: 'Agent disabled or not found' };
//     }

//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const successfulApplicationsToday = await AppliedJob.countDocuments({
//       student: studentId,
//       'agentData.agentId': agentId,
//       createdAt: { $gte: startOfDay },
//     });

//     const queuedApplicationsToday = jobsInApplyQueue.filter(
//       (j) =>
//         j.data.studentId === studentId &&
//         j.data.agentData?.agentId === agentId &&
//         new Date(j.timestamp) >= startOfDay,
//     ).length;

//     const totalAttemptsToday =
//       successfulApplicationsToday + queuedApplicationsToday;
//     const applicationLimit = agent.autopilotLimit || 5;

//     console.log(
//       `Attempts today: ${totalAttemptsToday} (Successful: ${successfulApplicationsToday}, Queued: ${queuedApplicationsToday}), Limit: ${applicationLimit}`,
//     );

//     if (totalAttemptsToday >= applicationLimit) {
//       console.log(`Daily limit reached for agent ${agentId}`);
//       return { skipped: true, reason: 'Daily limit reached' };
//     }

//     const remainingApplications = applicationLimit - totalAttemptsToday;
//     console.log(`Remaining applications: ${remainingApplications}`);

//     const appliedJobIds = (
//       await AppliedJob.find({
//         student: studentId,
//       }).distinct('job')
//     ).map((id) => id.toString());

//     const jobs = await getRecommendedJobs(studentId, {
//       ...agentConfig,
//       ...studentProfile.jobPreferences,
//     });

//     console.log(
//       `Found ${jobs.length} potential jobs for student ${studentId} and agent ${agentId} `,
//     );

//     if (jobs.length === 0) {
//       return { skipped: true, reason: 'No matching jobs' };
//     }

//     const uniqueJobs = jobs.filter((job) => {
//       if (!job || !job._id) {
//         console.warn('Found invalid job without _id field');
//         return false;
//       }
//       const jobId = job._id.toString();
//       return (
//         !appliedJobIds.includes(jobId) && !recentlyQueuedJobIds.includes(jobId)
//       );
//     });

//     console.log(`Found ${uniqueJobs.length} unique jobs not applied to before`);

//     if (uniqueJobs.length === 0) {
//       return { skipped: true, reason: 'No new unique jobs available' };
//     }

//     const scoredJobs = uniqueJobs
//       .map((job) => ({
//         job,
//         score: calculateMatchScore(job, {
//           ...studentProfile.jobPreferences,
//           ...agentConfig,
//         }),
//       }))
//       .sort((a, b) => b.score - a.score);

//     const jobsToProcess = scoredJobs.slice(0, remainingApplications);

//     const studentDetails = await Student.findById(studentId);
//     if (!student) {
//       console.log(`Student ${studentId} not found`);
//       return { skipped: true, reason: 'Student not found' };
//     }

//     const applicationPromises = jobsToProcess.map(({ job, score }) => {
//       console.log(`Queueing job "${job.title}" (Score: ${score.toFixed(2)})`);
//       console.log('Email to send:', studentProfile);

//       sendJobApplicationEmail({
//         jobData: { job },
//         student: studentDetails,
//         senderEmail: studentDetails.email,
//         recipientEmail: 'thesiddiqui7@gmail.com', // Or the correct recipient
//       });

//       const plainJobObject = JSON.parse(JSON.stringify(job));

//       return jobApplyQueue.add(
//         {
//           studentId,
//           jobData: {
//             job: plainJobObject,
//           },
//           agentData: { agentId, agentConfig },
//         },
//         {
//           attempts: 3,
//           backoff: { type: 'exponential', delay: 5000 },
//           removeOnComplete: true,
//           removeOnFail: true,
//         },
//       );
//     });

//     await Promise.all(applicationPromises);

//     return {
//       success: true,
//       applications: jobsToProcess.length,
//       agentId,
//       limit: applicationLimit,
//       appliedToday: totalAttemptsToday,
//     };
//   } catch (error) {
//     console.error(`Error processing job discovery:`, error);
//     throw error;
//   }
// });

// Event listeners

jobDiscoveryQueue.process(async (job) => {
  const {
    studentId,
    agentId,
    agentConfig,
    studentProfile,
    remainingApplications,
  } = job.data;

  try {
    const student = await Student.findById(studentId).lean();
    if (!student) {
      console.log(`Student ${studentId} not found`);
      return { skipped: true, reason: 'Student not found' };
    }
    if (!student.autopilotAgent || !Array.isArray(student.autopilotAgent)) {
      console.log(`Student ${studentId} has no autopilotAgent array defined.`);
      return { skipped: true, reason: 'Student has no autopilot agents' };
    }

    const agent = student.autopilotAgent.find((a) => a.agentId === agentId);
    if (!agent || !agent.autopilotEnabled) {
      console.log(`Agent ${agentId} not found or disabled`);
      return { skipped: true, reason: 'Agent disabled or not found' };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const cacheKey = `applied:${studentId}:${startOfDay.getTime()}`;
    let successfulApplicationsToday = await jobDiscoveryQueue.client.get(
      cacheKey,
    );
    successfulApplicationsToday = successfulApplicationsToday
      ? parseInt(successfulApplicationsToday, 10)
      : await AppliedJob.countDocuments({
          student: studentId,
          'agentData.agentId': agentId,
          createdAt: { $gte: startOfDay },
        });

    const jobsInApplyQueue = await jobApplyQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);
    const queuedApplicationsToday = jobsInApplyQueue.filter(
      (j) =>
        j.data.studentId === studentId &&
        j.data.agentData?.agentId === agentId &&
        new Date(j.timestamp) >= startOfDay,
    ).length;

    const totalAttemptsToday =
      successfulApplicationsToday + queuedApplicationsToday;
    const applicationLimit = Number(agent.autopilotLimit) || 5;

    console.log(
      `Attempts today: ${totalAttemptsToday} (Successful: ${successfulApplicationsToday}, Queued: ${queuedApplicationsToday}), Limit: ${applicationLimit}`,
    );

    const remainingApps = Math.min(
      Number(remainingApplications) || applicationLimit,
      applicationLimit - totalAttemptsToday,
    );

    console.log(`Remaining applications: ${remainingApps}`);

    if (isNaN(remainingApps) || remainingApps <= 0) {
      console.log(`Invalid remaining applications: ${remainingApps}`);
      return { skipped: true, reason: 'Invalid remaining applications' };
    }

    const appliedJobIds = (
      await AppliedJob.find({ student: studentId }).distinct('job')
    ).map((id) => id.toString());

    const recentlyQueuedJobIds = jobsInApplyQueue
      .map((j) => (j?.data?.jobData?.job?._id ? j.data.jobData.job._id : null))
      .filter((id) => id);

    const jobs = await getRecommendedJobs(studentId, {
      jobTitle: agentConfig.jobTitle,
      country: agentConfig.country,
      isRemote: agentConfig.isRemote,
      employmentType: agentConfig.employmentType,
      uploadedCVData: agentConfig.uploadedCVData,
    });

    console.log(
      `Found ${jobs.length} potential jobs for student ${studentId} and agent ${agentId}`,
    );

    if (jobs.length === 0) {
      return { skipped: true, reason: 'No matching jobs' };
    }

    const uniqueJobs = jobs.filter((job) => {
      if (!job || !job._id) {
        console.warn('Found invalid job without _id field');
        return false;
      }
      const jobId = job._id.toString();
      return (
        !appliedJobIds.includes(jobId) && !recentlyQueuedJobIds.includes(jobId)
      );
    });

    console.log(`Found ${uniqueJobs.length} unique jobs not applied to before`);

    if (uniqueJobs.length === 0) {
      return { skipped: true, reason: 'No new unique jobs available' };
    }

    const scoredJobs = uniqueJobs
      .map((job) => ({
        job,
        score: calculateMatchScore(
          job,
          {
            ...studentProfile.jobPreferences,
            jobTitle: agentConfig.jobTitle,
            isRemote: agentConfig.isRemote,
            employmentType: agentConfig.employmentType,
            uploadedCVData: agentConfig.uploadedCVData,
          },
          studentProfile.jobRole,
          studentProfile.skills,
          studentProfile.experience,
          studentProfile.education,
        ),
      }))
      .filter((s) => s.score >= 70)
      .sort((a, b) => b.score - a.score);

    if (scoredJobs.length === 0) {
      return { skipped: true, reason: 'No high-match jobs' };
    }

    const jobsToProcess = scoredJobs.slice(0, remainingApps);

    const studentDetails = await Student.findById(studentId);
    if (!studentDetails) {
      console.log(`Student ${studentId} not found`);
      return { skipped: true, reason: 'Student not found' };
    }

    const applicationPromises = jobsToProcess.map(({ job, score }) => {
      console.log(`Queueing job "${job.title}" (Score: ${score.toFixed(2)})`);
      sendJobApplicationEmail({
        jobData: { job },
        student: studentDetails,
        senderEmail: studentDetails.email,
        recipientEmail: job.applyMethod?.email || 'recruiter@example.com',
      });

      const plainJobObject = JSON.parse(JSON.stringify(job));
      return jobApplyQueue.add(
        {
          studentId,
          jobData: { job: plainJobObject },
          agentData: { agentId, agentConfig },
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    });

    await Promise.all(applicationPromises);

    await jobDiscoveryQueue.client.set(
      cacheKey,
      successfulApplicationsToday + jobsToProcess.length,
      'EX',
      86400,
    );

    return {
      success: true,
      applications: jobsToProcess.length,
      agentId,
      limit: applicationLimit,
      appliedToday: totalAttemptsToday,
    };
  } catch (error) {
    console.error(`Error processing job discovery:`, error);
    throw error;
  }
});

jobDiscoveryQueue.on('completed', (job, result) => {
  if (result.skipped) {
    console.log(`Job ${job.id} skipped: ${result.reason}`);
  } else {
    console.log(
      `Job ${job.id} completed - ${result.applications} applications queued`,
    );
  }
});

jobDiscoveryQueue.on('failed', (job, err) => {
  console.error(`Job discovery task ${job.id} failed:`, err.message);
});

jobDiscoveryQueue.on('active', (job) => {
  console.log(`Job discovery task ${job.id} is active`);
});

export default jobDiscoveryQueue;
