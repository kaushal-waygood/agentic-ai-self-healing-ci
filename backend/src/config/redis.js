// services/redisClient.js
import { createClient } from 'redis';
import { config } from '../config/config.js';

const url = `redis://${config.redisHost}:${config.redisPort}`;

class RedisClient {
  constructor() {
    this.client = createClient({ url });
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this._connecting = this.client.connect().catch((err) => {
      console.error('Initial redis connect error', err);
    });
  }

  async ensureConnected() {
    await this._connecting;
    if (!this.client.isReady) {
      try {
        await this.client.connect();
      } catch (err) {
        console.error('Redis ensureConnected error', err);
      }
    }
  }

  async get(key) {
    try {
      await this.ensureConnected();
      const value = await this.client.get(key);
      return value;
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
    try {
      await this.ensureConnected();
      return await this.client.keys(pattern);
    } catch (err) {
      console.error('Redis keys error:', err);
      return [];
    }
  }

  // Enhanced cache invalidation methods
  async invalidateStudentCache(studentId) {
    const patterns = [
      `student:${studentId}:*`,
      `student:${studentId}`,
      `jobs:recommended:${studentId}:*`,
      `jobs:applied:${studentId}:*`,
      `jobs:saved:${studentId}:*`,
      `jobs:viewed:${studentId}:*`,
      `jobs:visited:${studentId}:*`,
      `stats:${studentId}:*`,
    ];

    try {
      await this.ensureConnected();
      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
    } catch (err) {
      console.error('Cache invalidation error:', err);
    }
  }

  async invalidateJobCacheForStudent(studentId, jobId) {
    const keysToDelete = [
      `student:${studentId}:isSaved:${jobId}`,
      `student:${studentId}:isViewed:${jobId}`,
      `student:${studentId}:isVisited:${jobId}`,
    ];

    try {
      await this.ensureConnected();
      await this.del(keysToDelete);
    } catch (err) {
      console.error('Job cache invalidation error:', err);
    }
  }

  async invalidateAllJobsCache() {
    const patterns = [
      'jobs:all:*',
      'jobs:manual:*',
      'jobs:rapid:*',
      'jobs:filtered:*',
    ];

    try {
      await this.ensureConnected();
      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
    } catch (err) {
      console.error('All jobs cache invalidation error:', err);
    }
  }

  async withCache(key, ttl = 3600, callback) {
    try {
      await this.ensureConnected();
      const cached = await this.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await callback();

      if (result !== undefined && result !== null) {
        await this.set(key, JSON.stringify(result), ttl);
      }

      return result;
    } catch (err) {
      console.error('Cache operation error:', err);
      return await callback();
    }
  }

  // Batch cache operations for better performance
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
}

const redisClient = new RedisClient();
export default redisClient;
