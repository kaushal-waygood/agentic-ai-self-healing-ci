import { Queue } from 'bullmq';
import { bullmqConnection } from './bullmq.connection.js';

export const tailoredApplicationQueue = new Queue(
  'tailored-application-queue',
  {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  },
);
