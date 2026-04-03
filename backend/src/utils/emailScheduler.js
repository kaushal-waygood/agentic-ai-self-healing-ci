import cron from 'node-cron';
import { ScheduledEmail } from '../models/ScheduledEmail.model.js';
import { sendEmailWithRetry } from './transporter.js';
import { runWithCronTelemetry } from './cronMonitor.js';

const EMAIL_BATCH_LIMIT = Math.max(
  1,
  Number(process.env.EMAIL_SCHEDULER_BATCH_LIMIT) || 10,
);

/**
 * Starts a cron job that fires every minute.
 * It finds all pending ScheduledEmails whose scheduledAt <= now and sends them.
 */
export function startEmailScheduler() {
  cron.schedule('* * * * *', () =>
    runWithCronTelemetry('EmailScheduler', async () => {
      const now = new Date();

      let pending;
      try {
        pending = await ScheduledEmail.find({
          status: 'pending',
          scheduledAt: { $lte: now },
        })
          .sort({ scheduledAt: 1, createdAt: 1 })
          .limit(EMAIL_BATCH_LIMIT);
      } catch (err) {
        console.error('[EmailScheduler] Failed to query pending emails:', err);
        return;
      }

      if (!pending.length) return;

      console.log(
        `[EmailScheduler] Processing ${pending.length} scheduled email(s)…`,
      );

      for (const job of pending) {
        try {
          await sendEmailWithRetry({
            to: job.to,
            subject: job.subject,
            html: job.bodyHtml || '<p>Please find my application attached.</p>',
          });

          job.status = 'sent';
          await job.save();
          console.log(
            `[EmailScheduler] Sent scheduled email ${job._id} to ${job.to}`,
          );
        } catch (err) {
          job.status = 'failed';
          job.error = err.message || 'Unknown error';
          await job.save();
          console.error(
            `[EmailScheduler] Failed to send email ${job._id}:`,
            err.message,
          );
        }
      }
    }),
  );

  console.log(
    '[EmailScheduler] Started — checking every minute for scheduled emails.',
  );
}
