import { Worker } from 'bullmq';

import { bullmqConnection } from '../queues/bullmq.connection.js';
import { TAILORED_APPLICATION_JOB_KINDS } from '../queues/tailoredApplication.queue.js';
import { processTailoredApplication as processStudentApplication } from '../utils/tailored.autopilot.js';
import { processTailoredApplication as processStudentTailoredApplication } from '../utils/tailoredApply.background.js';

let tailoredApplicationWorker = null;

const getWorkerConcurrency = () => {
  const value = Number.parseInt(
    process.env.TAILORED_APPLICATION_WORKER_CONCURRENCY,
    10,
  );
  if (!Number.isFinite(value) || value <= 0) return 6;
  return Math.min(value, 12);
};

const processQueuedTailoredApplication = async (job, io) => {
  const {
    kind,
    userId,
    applicationId,
    applicationData,
    endpoint,
    processorOptions = {},
  } = job.data;

  if (kind === TAILORED_APPLICATION_JOB_KINDS.STUDENT_TAILORED_APPLICATION) {
    await processStudentTailoredApplication(
      userId,
      applicationId,
      applicationData,
      io,
      { rethrowOnError: true },
    );
    return;
  }

  if (kind === TAILORED_APPLICATION_JOB_KINDS.STUDENT_APPLICATION) {
    await processStudentApplication(
      userId,
      applicationId,
      applicationData,
      io,
      endpoint,
      {
        ...processorOptions,
        rethrowOnError: true,
      },
    );
    return;
  }

  throw new Error(`Unsupported tailored application job kind: ${kind}`);
};

export const startTailoredApplicationWorker = ({ io = null } = {}) => {
  if (tailoredApplicationWorker) return tailoredApplicationWorker;

  tailoredApplicationWorker = new Worker(
    'tailored-application-queue',
    async (job) => {
      await processQueuedTailoredApplication(job, io);
    },
    {
      connection: bullmqConnection,
      concurrency: getWorkerConcurrency(),
    },
  );

  tailoredApplicationWorker.on('completed', (job) => {
    console.log(
      `[TailoredApplicationWorker] Completed job ${job.id} (${job.name})`,
    );
  });

  tailoredApplicationWorker.on('failed', (job, err) => {
    console.error(
      `[TailoredApplicationWorker] Failed job ${job?.id}:`,
      err?.message || err,
    );
  });

  tailoredApplicationWorker.on('error', (err) => {
    console.error('[TailoredApplicationWorker] Worker error:', err);
  });

  return tailoredApplicationWorker;
};
