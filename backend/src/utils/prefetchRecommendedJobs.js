/**
 * Lightweight prefetch of recommended jobs for a user.
 * Uses local DB only (no external API) for fast response.
 * Called on login to warm cache so jobs-search loads instantly.
 */
import { buildUserProfileFromStudent } from '../controllers/student.controller.js';
import { setPrefetchedJobs } from './prefetchCache.js';
import {
  retrieveLocalCandidates,
  applyFilters,
  rankJobsWithIntentBoost,
  diversify,
  attachJobViews,
  buildInteractionContext,
} from '../utils/jobHelpers.js';

const PREFETCH_LIMIT = 10;
const PREFETCH_TIMEOUT_MS = 3000;

/**
 * Fetch up to PREFETCH_LIMIT recommended jobs from local DB only.
 * Returns { jobs, pagination } or null on error/timeout.
 */
export async function prefetchRecommendedJobsForUser(userId) {
  if (!userId) return null;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Prefetch timeout')), PREFETCH_TIMEOUT_MS),
  );

  try {
    const result = await Promise.race([
      doPrefetch(userId),
      timeoutPromise,
    ]);
    return result;
  } catch (err) {
    console.warn('Prefetch recommended jobs:', err?.message || err);
    return null;
  }
}

async function doPrefetch(userId) {
  const profile = await buildUserProfileFromStudent(userId);
  const interactions = await buildInteractionContext(userId);

  const primaryTitles = (profile.titles || []).filter(Boolean);
  const primaryIntent = primaryTitles.join(' ').trim() || 'jobs';
  const secondarySkills = (profile.skills || []).slice(0, 5);
  const vectorQuery = `${primaryIntent} ${secondarySkills.join(' ')}`.trim();
  const country = profile.location?.country || 'IN';
  const state = profile.location?.state;
  const city = profile.location?.city;

  const ctx = {
    type: 'recommendation',
    query: primaryIntent,
    vectorQuery,
    profile: { ...profile, userId },
    filters: { country, state, city },
    userId,
    interactions,
  };

  const localCandidates = await retrieveLocalCandidates(ctx, 500);
  const filtered = applyFilters(localCandidates, ctx);
  const ranked = rankJobsWithIntentBoost(filtered, ctx);
  const diversified = diversify(ranked.slice(0, PREFETCH_LIMIT));
  const jobsWithViews = await attachJobViews(diversified);

  const payload = {
    jobs: jobsWithViews,
    pagination: {
      currentPage: 1,
      hasNextPage: ranked.length > PREFETCH_LIMIT,
      totalJobs: ranked.length,
    },
  };

  await setPrefetchedJobs(userId, payload);

  return payload;
}
