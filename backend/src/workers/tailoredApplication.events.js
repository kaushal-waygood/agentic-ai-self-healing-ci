import { QueueEvents } from 'bullmq';
import { connection } from '../queues/connection.js';
import { User } from '../models/User.model.js';

const events = new QueueEvents('tailored-application-queue', { connection });

events.on('failed', async ({ jobId, failedReason, prev }) => {
  // BullMQ fires this on every attempt
});

events.on('completed', ({ jobId }) => {
  // nothing
});

events.on('drained', () => {
  console.log('[Queue] drained');
});

events.on('error', (err) => {
  console.error('[Queue Error]', err);
});
