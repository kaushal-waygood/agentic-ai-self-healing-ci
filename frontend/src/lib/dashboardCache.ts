/**
 * Frontend cache for dashboard API data.
 * Reduces loading time by serving cached data instantly while optionally
 * revalidating in the background.
 *
 * • In-memory + sessionStorage for instant load on refresh
 * • TTL-based expiry (default 5 min)
 * • Keys per API endpoint
 */

const CACHE_PREFIX = 'dashboard:';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function storageKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt < Date.now()) {
      sessionStorage.removeItem(storageKey(key));
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

function setToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
      fetchedAt: Date.now(),
    };
    sessionStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    // sessionStorage full or disabled
  }
}

/** Get cached data. Returns null when missing or expired. */
export function getDashboardCache<T>(key: string): T | null {
  const mem = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (mem && mem.expiresAt >= Date.now()) {
    return mem.data;
  }
  if (mem) memoryCache.delete(key);

  const stored = getFromStorage<T>(key);
  if (stored) {
    memoryCache.set(key, {
      data: stored,
      expiresAt: Date.now() + CACHE_TTL_MS,
      fetchedAt: Date.now(),
    });
    return stored;
  }
  return null;
}

/** Store data in cache (memory + sessionStorage). */
export function setDashboardCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
    fetchedAt: Date.now(),
  };
  memoryCache.set(key, entry as CacheEntry<unknown>);
  setToStorage(key, data);
}

/** Invalidate a specific cache key. */
export function invalidateDashboardCache(key: string): void {
  memoryCache.delete(key);
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(storageKey(key));
  }
}

/** Invalidate all dashboard caches. */
export function clearDashboardCache(): void {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  }
}

export const DASHBOARD_CACHE_KEYS = {
  PROFILE_STATUS: 'profile-status',
  STUDENT_DETAILS: 'student-details',
  BILLING: 'billing',
  AI_ACTIVITY: 'ai-activity',
  TOP_JOBS: 'top-jobs',
} as const;

export { CACHE_TTL_MS };
