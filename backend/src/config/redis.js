// services/redisClient.js
import { createClient } from 'redis';
import { config } from '../config/config.js';

const url = `redis://${config.redisHost}:${config.redisPort}`;

class RedisClient {
  constructor() {
    this.client = createClient({ url });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    // Attempt connect but do not throw — methods ensure connection before using.
    this._connecting = this.client.connect().catch((err) => {
      console.error('Initial redis connect error', err);
    });
  }

  async ensureConnected() {
    // wait for initial connect attempt to finish, then connect if not ready
    await this._connecting;
    if (!this.client.isReady) {
      try {
        await this.client.connect();
      } catch (err) {
        // If connect fails, log and let callers handle degraded mode.
        console.error('Redis ensureConnected error', err);
      }
    }
  }

  async isReady() {
    return !!this.client?.isReady;
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

  async invalidateStudentCache(studentId) {
    const patterns = [
      `student:${studentId}:*`,
      `student:${studentId}`,
      `jobs:recommended:${studentId}:*`,
      `jobs:applied:${studentId}:*`,
      `jobs:saved:${studentId}:*`,
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
        // assume we store JSON strings
        return JSON.parse(cached);
      }

      const result = await callback();

      if (result !== undefined && result !== null) {
        await this.set(key, JSON.stringify(result), ttl);
      }

      return result;
    } catch (err) {
      console.error('Cache operation error:', err);
      // fallback to direct call if redis fails
      return await callback();
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
