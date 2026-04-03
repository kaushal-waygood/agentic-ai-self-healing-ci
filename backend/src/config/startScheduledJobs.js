import { startCronsRenew } from './renew-cron/cron.js';
import { startPrefetchCron } from './cron-prefetch.js';
import {
  clearExpiredEmailChangeRequests,
  removeExpiredUnverifiedUsers,
} from '../utils/cron.js';
import { startAutopilotWorkerCron } from './autopilotWorkerCron.js';
import { startEmailScheduler } from '../utils/emailScheduler.js';

export function startScheduledJobs() {
  startCronsRenew();
  startPrefetchCron();
  clearExpiredEmailChangeRequests();
  removeExpiredUnverifiedUsers();
  startAutopilotWorkerCron();
  startEmailScheduler();
}

