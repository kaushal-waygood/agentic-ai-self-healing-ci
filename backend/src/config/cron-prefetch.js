import cron from 'node-cron';
import { Job } from '../models/jobs.model.js';
import {
  fetchExternalJobs,
  transformRapidApiJob,
  upsertExternalJobs,
} from '../utils/jobHelpers.js';
import { runWithCronTelemetry } from '../utils/cronMonitor.js';

const PREFETCH_QUERY_LIMIT = Math.max(
  1,
  Number(process.env.CRON_PREFETCH_QUERY_LIMIT) || 10,
);

export const startPrefetchCron = () => {
  // Run every 3 days at 3:00 AM
  cron.schedule('0 3 */3 * *', () =>
    runWithCronTelemetry('JobPrefetch', async () => {
      console.log(
        '🗓️  [Cron] Starting 3-day job prefetch for popular queries...',
      );
      try {
      // 1. Find the top 50 most popular search queries from our DB
      const popularQueriesRaw = await Job.aggregate([
        { $unwind: '$queries' },
        {
          $group: {
            _id: { $toLower: '$queries' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: PREFETCH_QUERY_LIMIT },
      ]);

      const topQueries = popularQueriesRaw.map((q) => q._id).filter(Boolean);
      console.log(
        `[Cron] Found ${topQueries.length} popular queries to prefetch.`,
      );

      for (const query of topQueries) {
        if (query === 'job' || query === 'jobs') continue; // Skip too generic terms if necessary

        console.log(`[Cron] Prefetching jobs for query: "${query}"`);

        // Fetch the first 2 pages for each popular query to keep the DB fresh
        // Defaulting to 'IN' as a primary market, but can be scaled if needed.
        const pagesToFetch = [1, 2];
        const fetchPromises = pagesToFetch.map((page) =>
          fetchExternalJobs(
            query,
            'IN', // Default country for prefetch
            null,
            null,
            'week', // recent jobs only
            null,
            null,
            page,
          ).catch((err) => {
            console.error(
              `[Cron] RapidAPI fetch error for ${query}:`,
              err.message,
            );
            return [];
          }),
        );

        const responsesRaw = await Promise.all(fetchPromises);
        const externalRaw = responsesRaw.flat().filter(Boolean);

        if (externalRaw.length > 0) {
          const formatted = externalRaw.map((j) =>
            transformRapidApiJob(j, query),
          );
          await upsertExternalJobs(formatted).catch((e) =>
            console.error(`[Cron] Upsert Error for "${query}":`, e.message),
          );
          console.log(
            `[Cron] Successfully upserted ${formatted.length} jobs for "${query}"`,
          );
        } else {
          console.log(`[Cron] No new external jobs found for "${query}"`);
        }

        // Add a small delay between RapidAPI calls to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

        console.log('✅ [Cron] 3-day job prefetch completed.');
      } catch (error) {
        console.error('❌ [Cron] Error during job prefetch:', error);
      }
    }),
  );

  console.log('🗓️  Job Prefetch cron scheduled (runs every 3 days).');
};
