import { fetchAndUpsertMoreExternalJobs } from './jobHelpers.js';
import { makeRecoKey, setCachedReco } from './recoCache.js';
import redis from '../config/redis.js';
import { getLocalRecommendedJobs } from './jobHelpers.js';

/**
 * Fire-and-forget background warmup
 */
export async function triggerBackgroundIngestion(profile) {
  setImmediate(async () => {
    try {
      await fetchAndUpsertMoreExternalJobs(profile);

      const freshJobs = await getLocalRecommendedJobs(profile);
      const cacheKey = makeRecoKey(profile);

      await setCachedReco(cacheKey, freshJobs.slice(0, 50));
    } catch (err) {
      console.error('[BG-INGEST]', err.message);
    }
  });
}
