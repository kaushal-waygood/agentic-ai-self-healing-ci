/**
 * Frontend cache for job search / recommended-job results.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Behaviour                                                          │
 * ├──────────────────────────────────────────────────────────────────────┤
 * │ • In-memory Map with TTL-based expiry (default 5 min)              │
 * │ • Deterministic cache keys via sorted JSON stringification         │
 * │ • Automatic LRU-like pruning when the map exceeds MAX_CACHE_ENTRIES│
 * │ • `invalidateByPrefix` lets you clear search OR recommend entries  │
 * │   independently                                                    │
 * └──────────────────────────────────────────────────────────────────────┘
 */

export interface CachedJobData {
  jobs: any[];
  pagination: any;
}

interface CacheEntry {
  data: CachedJobData;
  expiresAt: number;
  createdAt: number;
}

const jobCache = new Map<string, CacheEntry>();

/** Time-to-live in milliseconds (5 minutes) */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Hard cap on number of entries kept in the Map */
const MAX_CACHE_ENTRIES = 100;

// ──────────────────────────────────────────────
// Key helpers
// ──────────────────────────────────────────────

/**
 * Build a deterministic cache key from a prefix (e.g. "search", "recommend")
 * and an arbitrary params object. Keys of `params` are sorted so that
 * `{ q: 'a', page: 1 }` and `{ page: 1, q: 'a' }` produce the same key.
 *
 * Empty-ish values (empty strings, empty arrays, undefined, null) are
 * stripped so that omitting a filter and passing it as `""` are equivalent.
 */
function makeCacheKey(prefix: string, params: Record<string, any>): string {
  const cleaned: Record<string, any> = {};

  for (const key of Object.keys(params).sort()) {
    const val = params[key];
    // skip empty / irrelevant values
    if (val === undefined || val === null || val === '') continue;
    if (Array.isArray(val) && val.length === 0) continue;
    // skip the `append` flag — it's a UI concern, not a query identity
    if (key === 'append') continue;
    cleaned[key] = val;
  }

  return `${prefix}:${JSON.stringify(cleaned)}`;
}

// ──────────────────────────────────────────────
// Cache operations
// ──────────────────────────────────────────────

/** Get a cached entry. Returns `undefined` when missing **or** expired. */
function getCache(key: string): CachedJobData | undefined {
  const entry = jobCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    jobCache.delete(key);
    return undefined;
  }
  return entry.data;
}

/** Store data in the cache and prune if needed. */
function setCache(key: string, data: CachedJobData): void {
  jobCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
    createdAt: Date.now(),
  });
  pruneCache();
}

/** Remove all expired entries, then evict oldest if still over limit. */
function pruneCache(): void {
  const now = Date.now();

  // 1. Remove expired entries
  for (const [key, entry] of jobCache) {
    if (entry.expiresAt < now) jobCache.delete(key);
  }

  // 2. If still over capacity, remove oldest entries until within limit
  while (jobCache.size > MAX_CACHE_ENTRIES) {
    const firstKey = jobCache.keys().next().value;
    if (firstKey !== undefined) jobCache.delete(firstKey);
    else break;
  }
}

/**
 * Invalidate (delete) all cache entries whose key starts with a given prefix.
 * Useful when external data changes and a subset of the cache is stale.
 *
 * @example invalidateByPrefix('search');   // clears all search caches
 * @example invalidateByPrefix('recommend'); // clears all recommend caches
 */
function invalidateByPrefix(prefix: string): void {
  for (const key of Array.from(jobCache.keys())) {
    if (key.startsWith(`${prefix}:`)) {
      jobCache.delete(key);
    }
  }
}

/** Clear the entire cache. */
function clearCache(): void {
  jobCache.clear();
}

/** Return current cache size (useful for debugging). */
function cacheSize(): number {
  return jobCache.size;
}

export {
  jobCache,
  makeCacheKey,
  getCache,
  setCache,
  pruneCache,
  invalidateByPrefix,
  clearCache,
  cacheSize,
  CACHE_TTL_MS,
  MAX_CACHE_ENTRIES,
};
