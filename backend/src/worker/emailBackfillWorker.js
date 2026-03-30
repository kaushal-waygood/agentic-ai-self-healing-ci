
import { Job } from '../models/jobs.model.js';
import { runEmailScrape } from '../config/geminiCron.js';

const BATCH_SIZE = Number(process.env.EMAIL_BACKFILL_BATCH) || 20;
const CONCURRENCY = 5;

async function withConcurrency(items, handler, concurrency) {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length || 1) },
    async () => {
      for (;;) {
        const item = queue.shift();
        if (!item) break;
        await handler(item);
      }
    },
  );
  await Promise.allSettled(workers);
}

/**
 * Finds jobs with no scraped emails and fills them in.
 * Called automatically by the cron every 6 hours.
 */
export const backfillMissingEmails = async () => {
  const jobs = await Job.find({
    company: { $exists: true, $ne: '' },
    $or: [
      { scrapedEmails: { $exists: false } },
      { scrapedEmails: { $size: 0 } },
    ],
  })
    .select('_id company location country')
    .limit(BATCH_SIZE)
    .lean();

  if (!jobs.length) return { backfilled: 0 };

  let backfilled = 0;

  await withConcurrency(
    jobs,
    async (job) => {
      if (!job.company) return;
      const locationStr = [job.location?.city, job.location?.state, job.country]
        .filter(Boolean)
        .join(', ');

      try {
        const res = await runEmailScrape(job.company, locationStr);
        if (res?.allFoundDetails?.length > 0) {
          await Job.updateOne(
            { _id: job._id },
            { $set: { scrapedEmails: res.allFoundDetails } },
          );
          backfilled++;

          if (process.env.DEBUG_AUTOPILOT === '1') {
            console.log(
              `[EmailBackfill] ✓ ${job.company} — ${res.allFoundDetails.length} email(s)`,
            );
          }
        }
      } catch (err) {
        console.error(
          `[EmailBackfill] Failed for "${job.company}":`,
          err.message,
        );
      }
    },
    CONCURRENCY,
  );

  return { backfilled };
};
