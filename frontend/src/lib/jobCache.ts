const jobCache = new Map<
  string,
  { data: { jobs: any[]; pagination: any }; expiresAt: number }
>();

const CACHE_TTL_MS = 300000;
const MAX_CACHE_ENTRIES = 100;

function makeCacheKey(prefix: string, params: Record<string, any>): string {
  // Sort keys to ensure {q: 'a', p: 1} and {p: 1, q: 'a'} produce the same key
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${prefix}:${JSON.stringify(sortedParams)}`;
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of jobCache) {
    if (entry.expiresAt < now) jobCache.delete(key);
  }
  if (jobCache.size > MAX_CACHE_ENTRIES) {
    const firstKey = jobCache.keys().next().value;
    jobCache.delete(firstKey);
  }
}

export { jobCache, makeCacheKey, pruneCache, CACHE_TTL_MS, MAX_CACHE_ENTRIES };
