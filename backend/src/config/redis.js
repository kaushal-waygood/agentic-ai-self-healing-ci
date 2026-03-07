import { createClient } from 'redis';
import { config } from '../config/config.js';

const url = `redis://${config.redisHost}:${config.redisPort}`;

class RedisClient {
  constructor() {
    this.client = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          // exponential backoff with cap
          return Math.min(retries * 100, 2000);
        },
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // single connect promise (IMPORTANT)
    this._connectPromise = this.client.connect().catch((err) => {
      console.error('Initial Redis connection failed:', err);
    });
  }

  /* -----------------------------
     Connection handling (SAFE)
     ----------------------------- */

  async ensureConnected() {
    await this._connectPromise;
    if (!this.client.isReady) {
      throw new Error('Redis client not ready');
    }
  }

  /* -----------------------------
     Internal SCAN helper
     ----------------------------- */

  async scanKeys(pattern) {
    const keys = [];
    let cursor = '0';

    do {
      const result = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: 200,
      });
      cursor = result.cursor;
      if (result.keys?.length) {
        keys.push(...result.keys);
      }
    } while (cursor !== '0');

    return keys;
  }

  /* -----------------------------
     Core cache ops
     ----------------------------- */

  async get(key) {
    try {
      await this.ensureConnected();
      return await this.client.get(key);
    } catch (err) {
      console.error('Redis get error:', err);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.ensureConnected();
      if (ttl > 0) {
        await this.client.set(key, value, { EX: ttl });
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  async del(keys) {
    try {
      await this.ensureConnected();
      if (!keys) return;

      if (Array.isArray(keys)) {
        if (keys.length === 0) return;
        await this.client.del(keys);
      } else {
        await this.client.del(keys);
      }
    } catch (err) {
      console.error('Redis delete error:', err);
    }
  }

  async keys(pattern) {
    // ⚠️ kept for backward compatibility
    // internally uses SCAN now
    try {
      await this.ensureConnected();
      return await this.scanKeys(pattern);
    } catch (err) {
      console.error('Redis keys error:', err);
      return [];
    }
  }

  /* -----------------------------
     Atomic helpers
     ----------------------------- */

  async setNxWithTtl(key, value, ttlSeconds) {
    try {
      await this.ensureConnected();
      const res = await this.client.set(key, value, {
        NX: true,
        EX: ttlSeconds,
      });
      return res === 'OK';
    } catch (err) {
      console.error('Redis setNxWithTtl error:', err);
      return false;
    }
  }

  async mget(keys) {
    try {
      await this.ensureConnected();
      return await this.client.mGet(keys);
    } catch (err) {
      console.error('Redis mget error:', err);
      return [];
    }
  }

  async mset(keyValuePairs, ttl = 3600) {
    try {
      await this.ensureConnected();
      const pipeline = this.client.multi();

      for (const [key, value] of keyValuePairs) {
        if (ttl > 0) {
          pipeline.set(key, JSON.stringify(value), { EX: ttl });
        } else {
          pipeline.set(key, JSON.stringify(value));
        }
      }

      await pipeline.exec();
    } catch (err) {
      console.error('Redis mset error:', err);
    }
  }

  /* -----------------------------
     Cache wrappers
     ----------------------------- */

  async withCache(key, ttl = 3600, callback) {
    try {
      await this.ensureConnected();

      const cached = await this.get(key);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return cached;
        }
      }

      const result = await callback();
      if (result !== undefined && result !== null) {
        await this.set(key, JSON.stringify(result), ttl);
      }

      return result;
    } catch (err) {
      console.error('Redis withCache error:', err);
      return await callback();
    }
  }

  /* -----------------------------
     Invalidation helpers (SAFE)
     ----------------------------- */

  async invalidateJobCache(jobId) {
    if (!jobId) return;

    const patterns = [
      `job:${jobId}`,
      `job:${jobId}:*`,
      `job:*:${jobId}`,
      `jobs:search*`,
      `jobs:all:*`,
      `jobs:manual:*`,
      `jobs:rapid:*`,
    ];

    try {
      await this.ensureConnected();

      const toDelete = new Set();

      for (const pattern of patterns) {
        const keys = await this.scanKeys(pattern);
        keys.forEach((k) => toDelete.add(k));
      }

      if (toDelete.size > 0) {
        await this.client.del([...toDelete]);
      }
    } catch (err) {
      console.error('invalidateJobCache error:', err);
    }
  }

  async invalidateStudentCache(studentId) {
    if (!studentId) return;

    const patterns = [
      `student:${studentId}`,
      `student:${studentId}:*`,
      `jobs:recommended:${studentId}:*`,
      `jobs:applied:${studentId}:*`,
      `jobs:saved:${studentId}:*`,
      `jobs:viewed:${studentId}:*`,
      `jobs:visited:${studentId}:*`,
      `stats:${studentId}:*`,
      `autofill:student:${studentId}`,
      `autofill:ai:${studentId}:*`,
    ];

    try {
      await this.ensureConnected();

      for (const pattern of patterns) {
        const keys = await this.scanKeys(pattern);
        if (keys.length) {
          await this.client.del(keys);
        }
      }
    } catch (err) {
      console.error('invalidateStudentCache error:', err);
    }
  }

  async invalidateUserCache(userId) {
    if (!userId) return;

    const patterns = [`user:${userId}`, `user:${userId}:*`];

    try {
      await this.ensureConnected();

      for (const pattern of patterns) {
        const keys = await this.scanKeys(pattern);
        if (keys.length) {
          await this.client.del(keys);
        }
      }
    } catch (err) {
      console.error('invalidateUserCache error:', err);
    }
  }

  async invalidateJobCacheForStudent(studentId, jobId) {
    if (!studentId || !jobId) return;

    const keys = [
      `student:${studentId}:isSaved:${jobId}`,
      `student:${studentId}:isViewed:${jobId}`,
      `student:${studentId}:isVisited:${jobId}`,
    ];

    try {
      await this.ensureConnected();
      await this.del(keys);
    } catch (err) {
      console.error('invalidateJobCacheForStudent error:', err);
    }
  }

  async invalidateAllJobsCache() {
    const patterns = [
      'jobs:all:*',
      'jobs:manual:*',
      'jobs:rapid:*',
      'jobs:filtered:*',
      'jobs:recommended:*',
    ];

    try {
      await this.ensureConnected();

      for (const pattern of patterns) {
        const keys = await this.scanKeys(pattern);
        if (keys.length) {
          await this.client.del(keys);
        }
      }
    } catch (err) {
      console.error('invalidateAllJobsCache error:', err);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
