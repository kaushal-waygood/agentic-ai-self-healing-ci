import cron from 'node-cron';
import { autoRenewCron } from './autoRenew.js';
import { activateRenewalsCron } from './activateRenewals.js';

export function startCronsRenew() {
  console.log('[CRON] starting cron jobs');

  // Runs every hour
  cron.schedule('0 * * * * *', async () => {
    // every second
    console.log('[CRON] auto-renew + activate started');
    await autoRenewCron();
    await activateRenewalsCron();

    console.log('[CRON] auto-renew + activate finished');
  });
}
