import cron from 'node-cron';
import { findAndProcessJobs } from '../worker/autopilotWorker.js';
import { backfillMissingEmails } from '../worker/emailBackfillWorker.js';
import { retryFailedApplications } from '../worker/retryWorker.js';

const toBool = (v) => v === true || String(v).toLowerCase() === 'true';
const isEnabled = () => toBool(process.env.AUTOGEN_TAILORED || 'false');

// ── Per-job lock flags (prevent overlapping runs) ────────────
const locks = {
  findAndApply: false,
  emailBackfill: false,
  retryFailed: false,
};

// ── Runner factory ───────────────────────────────────────────
const makeRunner = (lockKey, label, handler) => async () => {
  if (!isEnabled()) {
    if (process.env.DEBUG_AUTOPILOT === '1') {
      console.log(
        `[AutopilotCron] ${label} skipped — AUTOGEN_TAILORED not true`,
      );
    }
    return;
  }
  if (locks[lockKey]) {
    console.log(
      `[AutopilotCron] ${label} skipping — previous run still in progress`,
    );
    return;
  }

  locks[lockKey] = true;
  console.log(`🚀 [AutopilotCron] ${label} started...`);

  try {
    const result = await handler();
    console.log(`✅ [AutopilotCron] ${label} complete.`, result ?? '');
  } catch (err) {
    console.error(`❌ [AutopilotCron] ${label} error:`, err?.message || err);
  } finally {
    locks[lockKey] = false;
  }
};

// ── The three workers ────────────────────────────────────────

// 1. Find new jobs + scrape emails + generate tailored applications
const runFindAndApply = makeRunner('findAndApply', 'FindAndApply', async () => {
  const result = await findAndProcessJobs();
  return [
    `Agents checked: ${result?.agentsChecked ?? 0}`,
    `Processed: ${result?.processed ?? 0}`,
    `Already searched today: ${result?.alreadySearchedToday ?? 0}`,
    `Pool already full: ${result?.poolAlreadyFull ?? 0}`,
    `Plan agent cap reached: ${result?.planAgentCapReached ?? 0}`,
    `No jobs found: ${result?.noJobsFound ?? 0}`,
    `Autopilot disabled: ${result?.autopilotDisabled ?? 0}`,
    `Missing profile: ${result?.missingProfile ?? 0}`,
  ].join(', ');
});

// 2. Backfill emails for jobs that still have none
const runEmailBackfill = makeRunner(
  'emailBackfill',
  'EmailBackfill',
  async () => {
    const result = await backfillMissingEmails();
    return `Jobs backfilled: ${result?.backfilled ?? 0}`;
  },
);

// 3. Retry applications that previously failed generation
const runRetryFailed = makeRunner('retryFailed', 'RetryFailed', async () => {
  const result = await retryFailedApplications();
  return `Retried: ${result?.retried ?? 0}`;
});

// ── Scheduler ────────────────────────────────────────────────

/**
 * Start all autopilot cron jobs.
 *
 * Schedules (all overridable via env):
 *   CRON_FIND_AND_APPLY   — default: every 1 min  (your original)
 *   CRON_EMAIL_BACKFILL   — default: every 6 hours
 *   CRON_RETRY_FAILED     — default: every 4 hours
 *
 * @param {object} io - socket.io instance (optional, for real-time notifications)
 */
export const startAutopilotWorkerCron = (
  io = null,
  schedule = '*/1 * * * *',
) => {
  if (process.env.AUTOPILOT_CRON_ENABLED === 'false') {
    console.log('[AutopilotCron] Disabled via AUTOPILOT_CRON_ENABLED=false');
    return null;
  }

  // 1. Find & Apply (your original schedule)
  const findAndApplySchedule = process.env.CRON_FIND_AND_APPLY || schedule;
  cron.schedule(findAndApplySchedule, runFindAndApply);
  console.log(
    `🗓️  [AutopilotCron] FindAndApply scheduled (${findAndApplySchedule})`,
  );

  // 2. Email backfill
  const emailBackfillSchedule =
    process.env.CRON_EMAIL_BACKFILL || '0 */6 * * *';
  cron.schedule(emailBackfillSchedule, runEmailBackfill);
  console.log(
    `🗓️  [AutopilotCron] EmailBackfill scheduled (${emailBackfillSchedule})`,
  );

  // 3. Retry failed
  const retryFailedSchedule = process.env.CRON_RETRY_FAILED || '15 */4 * * *';
  cron.schedule(retryFailedSchedule, runRetryFailed);
  console.log(
    `🗓️  [AutopilotCron] RetryFailed scheduled (${retryFailedSchedule})`,
  );

  console.log(
    '[AutopilotCron] Set AUTOGEN_TAILORED=true to enable processing.',
  );

  // Run once after 30s on boot (your original behaviour)
  if (isEnabled()) {
    setTimeout(() => runFindAndApply(), 30_000);
  }

  // Return manual triggers (useful for admin endpoints)
  return { runFindAndApply, runEmailBackfill, runRetryFailed };
};
