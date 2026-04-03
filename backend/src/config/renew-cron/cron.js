import cron from 'node-cron';
import { autoRenewCron } from './autoRenew.js';
import { activateRenewalsCron } from './activateRenewals.js';
import { runWithCronTelemetry } from '../../utils/cronMonitor.js';

export function startCronsRenew() {
  // console.log('[CRON] starting cron jobs');

  const schedule = process.env.CRON_RENEW_SCHEDULE || '0 */5 * * * *';

  // Runs every 5 minutes by default
  cron.schedule(schedule, () =>
    runWithCronTelemetry('Renewals', async () => {
      // console.log('[CRON] auto-renew + activate started');
      await autoRenewCron();
      await activateRenewalsCron();

      // console.log('[CRON] auto-renew + activate finished');
    }),
  );
}
