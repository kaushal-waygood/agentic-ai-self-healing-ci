/**
 * Autopilot worker cron - runs findAndProcessJobs on a schedule.
 * Integrates the worker.js logic into the main server process.
 *
 * Requires: AUTOGEN_TAILORED=true for actual processing.
 * Toggle: AUTOPILOT_CRON_ENABLED=true (default: true when AUTOGEN_TAILORED is set)
 */
import cron from 'node-cron';
import { findAndProcessJobs } from '../worker/autopilotWorker.js';

const toBool = (v) => v === true || String(v).toLowerCase() === 'true';

let isRunning = false;

const runAutopilotWorker = async () => {
  if (isRunning) {
    console.log('[AutopilotCron] Skipping - previous run still in progress.');
    return;
  }
  if (!toBool(process.env.AUTOGEN_TAILORED || 'false')) {
    return; // Worker logic is disabled
  }

  isRunning = true;
  try {
    console.log('🚀 [AutopilotCron] Starting autopilot job-finding cycle...');
    const result = await findAndProcessJobs();
    console.log(
      `✅ [AutopilotCron] Cycle complete. Students checked: ${result?.studentsChecked ?? 0}, Processed: ${result?.processed ?? 0}`,
    );
  } catch (err) {
    console.error('❌ [AutopilotCron] Error:', err?.message || err);
  } finally {
    isRunning = false;
  }
};

/**
 * Schedule the autopilot worker to run periodically.
 * @param {string} schedule - Cron expression (default: every 15 minutes)
 */
export const startAutopilotWorkerCron = (schedule = '* * * * *') => {
  if (process.env.AUTOPILOT_CRON_ENABLED === 'false') {
    console.log('[AutopilotCron] Disabled via AUTOPILOT_CRON_ENABLED=false');
    return null;
  }

  cron.schedule(schedule, runAutopilotWorker);
  console.log(
    `🗓️  [AutopilotCron] Scheduled to run every 15 minutes (${schedule})`,
  );
  return runAutopilotWorker; // Export for manual trigger if needed
};
