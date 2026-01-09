import IORedis from 'ioredis';
import { config } from '../config/config.js';

export const bullmqConnection = new IORedis({
  host: config.redisHost,
  port: config.redisPort,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
