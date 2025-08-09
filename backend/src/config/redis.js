import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.connect();
  }

  async isReady() {
    return this.client.isReady;
  }

  async get(key) {
    try {
      if (!(await this.isReady())) await this.client.connect();
      return await this.client.get(key);
    } catch (err) {
      console.error('Redis get error:', err);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (!(await this.isReady())) await this.client.connect();
      await this.client.set(key, value, { EX: ttl });
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  async del(key) {
    try {
      if (!(await this.isReady())) await this.client.connect();
      await this.client.del(key);
    } catch (err) {
      console.error('Redis delete error:', err);
    }
  }

  async keys(pattern) {
    try {
      if (!(await this.isReady())) await this.client.connect();
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
      if (!(await this.isReady())) await this.client.connect();

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
      if (!(await this.isReady())) await this.client.connect();

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
  async withCache(key, ttl, callback) {
    // Add ttl as a separate parameter
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached) return JSON.parse(cached);

      // Execute callback if cache miss
      const result = await callback();

      // Cache the result
      if (result) {
        await this.set(key, JSON.stringify(result), ttl);
      }

      return result;
    } catch (err) {
      console.error('Cache operation error:', err);
      return await callback(); // Fallback to direct call
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
