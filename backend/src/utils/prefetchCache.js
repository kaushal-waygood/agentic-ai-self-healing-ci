/**
 * Redis cache for prefetched recommended jobs.
 * Separate module to avoid circular imports.
 */
import redisClient from '../config/redis.js';

const PREFETCH_KEY = (userId) => `jobs:prefetch:${userId}`;
const PREFETCH_TTL = 600; // 10 minutes

export async function getPrefetchedJobs(userId) {
  if (!userId) return null;
  try {
    const raw = await redisClient.get(PREFETCH_KEY(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setPrefetchedJobs(userId, payload) {
  if (!userId || !payload) return;
  try {
    await redisClient.set(PREFETCH_KEY(userId), JSON.stringify(payload), PREFETCH_TTL);
  } catch (err) {
    console.warn('setPrefetchedJobs:', err?.message);
  }
}
