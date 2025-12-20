import redis from '../config/redis.js';

export const RECO_TTL = 60 * 15; // 15 minutes

export function makeRecoKey(profile) {
  const loc = profile.location || {};
  return [
    'jobs:recommended:v2',
    profile._id,
    loc.country || 'any',
    loc.state || 'any',
    loc.city || 'any',
  ].join(':');
}

export async function getCachedReco(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCachedReco(key, jobs) {
  if (!jobs?.length) return;
  await redis.set(key, JSON.stringify(jobs), 'EX', RECO_TTL);
}
