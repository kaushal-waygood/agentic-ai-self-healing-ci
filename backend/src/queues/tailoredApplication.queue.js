import { Queue } from 'bullmq';
import { bullmqConnection } from './bullmq.connection.js';

export const TAILORED_APPLICATION_JOB_KINDS = {
  STUDENT_APPLICATION: 'student-application',
  STUDENT_TAILORED_APPLICATION: 'student-tailored-application',
};

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

export const addTailoredApplicationJob = async ({
  kind,
  userId,
  applicationId,
  applicationData,
  endpoint = null,
  processorOptions = {},
  jobKey,
}) => {
  if (!kind) throw new Error('Queue job kind is required');
  if (!userId) throw new Error('Queue userId is required');
  if (!applicationId) throw new Error('Queue applicationId is required');
  if (!applicationData) throw new Error('Queue applicationData is required');

  const normalizedJobId = String(
    jobKey || `${kind}-${applicationId}`,
  ).replace(/:/g, '-');

  return tailoredApplicationQueue.add(
    'generate-tailored-application',
    {
      kind,
      userId,
      applicationId,
      applicationData,
      endpoint,
      processorOptions,
    },
    {
      jobId: normalizedJobId,
    },
  );
};
