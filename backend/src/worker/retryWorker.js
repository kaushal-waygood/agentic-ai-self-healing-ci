// src/worker/retryWorker.js

import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { buildEffectiveStudentProfile } from '../utils/profileHydration.js';
import { buildApplicationData } from '../utils/buildAgentApplicationData.js';
import {
  addTailoredApplicationJob,
  TAILORED_APPLICATION_JOB_KINDS,
} from '../queues/tailoredApplication.queue.js';

const MAX_RETRIES = Number(process.env.APP_MAX_RETRIES) || 2;
const BATCH_SIZE = Math.max(1, Number(process.env.RETRY_WORKER_BATCH) || 5);

/**
 * Retries agent-generated tailored applications stuck in failed status.
 * Gives up after MAX_RETRIES attempts.
 * Called automatically by the cron every 4 hours.
 */
export const retryFailedApplications = async () => {
  const failedApps = await StudentTailoredApplication.find({
    flag: 'agent',
    status: 'failed',
    retryCount: { $lt: MAX_RETRIES },
  })
    .populate('jobId')
    .limit(BATCH_SIZE)
    .lean();

  if (!failedApps.length) return { retried: 0 };

  let retried = 0;

  for (const app of failedApps) {
    try {
      const studentProfile = await getStudentProfileSnapshot(app.student);
      if (!studentProfile) continue;

      const agent = await StudentAgent.findOne({
        student: app.student,
        isAgentActive: true,
      }).lean();

      const effectiveStudent = agent
        ? buildEffectiveStudentProfile(studentProfile, agent)
        : studentProfile;

      const appData = buildApplicationData(
        app.jobId,
        effectiveStudent,
        agent?.finalTouch || '',
      );

      // Mark as retrying so UI shows progress
      await StudentTailoredApplication.updateOne(
        { _id: app._id },
        {
          $set: { status: 'pending', error: null, completedAt: null },
          $inc: { retryCount: 1 },
        },
      );

      await addTailoredApplicationJob({
        kind: TAILORED_APPLICATION_JOB_KINDS.STUDENT_TAILORED_APPLICATION,
        userId: app.student.toString(),
        applicationId: app._id.toString(),
        applicationData: appData,
        jobKey: `retry-${app._id}-${app.retryCount || 0}`,
      });
      retried++;

      if (process.env.DEBUG_AUTOPILOT === '1') {
        console.log(`[RetryWorker] ✓ app=${app._id} retried successfully`);
      }
    } catch (err) {
      console.error(`[RetryWorker] Failed app=${app._id}:`, err.message);

      // Mark as failed again with updated retry count
      await StudentTailoredApplication.updateOne(
        { _id: app._id },
        {
          $set: { status: 'failed', error: err.message },
          $inc: { retryCount: 1 },
        },
      ).catch(() => {});
    }
  }

  return { retried };
};
