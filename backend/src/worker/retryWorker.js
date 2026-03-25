// src/worker/retryWorker.js

import { StudentApplication } from '../models/students/studentApplication.model.js';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { buildEffectiveStudentProfile } from '../utils/profileHydration.js';
import { buildApplicationData } from '../worker/autopilotWorker.js';
import { processTailoredApplication } from '../utils/tailored.autopilot.js';

const MAX_RETRIES = Number(process.env.APP_MAX_RETRIES) || 2;
const BATCH_SIZE = 10;

/**
 * Retries StudentApplications stuck in 'Failed' status.
 * Gives up after MAX_RETRIES attempts.
 * Called automatically by the cron every 4 hours.
 */
export const retryFailedApplications = async () => {
  const failedApps = await StudentApplication.find({
    status: 'Failed',
    retryCount: { $lt: MAX_RETRIES },
  })
    .populate('job')
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
        app.job,
        effectiveStudent,
        agent?.finalTouch || '',
      );

      // Mark as retrying so UI shows progress
      await StudentApplication.updateOne(
        { _id: app._id },
        {
          $set: { status: 'Generating', error: null },
          $inc: { retryCount: 1 },
        },
      );

      await processTailoredApplication(
        app.student,
        app._id,
        appData,
        null,
        null,
      );
      retried++;

      if (process.env.DEBUG_AUTOPILOT === '1') {
        console.log(`[RetryWorker] ✓ app=${app._id} retried successfully`);
      }
    } catch (err) {
      console.error(`[RetryWorker] Failed app=${app._id}:`, err.message);

      // Mark as failed again with updated retry count
      await StudentApplication.updateOne(
        { _id: app._id },
        {
          $set: { status: 'Failed', error: err.message },
          $inc: { retryCount: 1 },
        },
      ).catch(() => {});
    }
  }

  return { retried };
};
