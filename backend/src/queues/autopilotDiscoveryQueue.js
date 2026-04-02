import Queue from 'bull';
import { processAgentDiscovery } from '../worker/autopilotWorker.js';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: 6379,
  redis: {
    connectTimeout: 30000,
  },
};

const autopilotDiscoveryQueue = new Queue('autopilot-discovery', {
  redis: redisConfig,
  limiter: {
    max: 5,
    duration: 1000,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

autopilotDiscoveryQueue.client.on('connect', () => {
  console.log(
    `[AutopilotDiscoveryQueue] Redis client connected for process ${process.pid}`,
  );
});

autopilotDiscoveryQueue.client.on('error', (err) => {
  console.error(
    `[AutopilotDiscoveryQueue] Redis client connection error for process ${process.pid}:`,
    err,
  );
});

autopilotDiscoveryQueue.process(async (job) => {
  const { agent, force } = job.data;
  const forceTag = force ? ' [FORCE]' : '';
  console.log(
    `[AutopilotDiscoveryQueue] Starting discovery for agent "${agent.agentName}" (${agent._id})${forceTag}`,
  );

  try {
    const result = await processAgentDiscovery(agent, { force });
    console.log(
      `[AutopilotDiscoveryQueue] Discovery completed for agent "${agent.agentName}": ${result.processed} jobs processed`,
    );
    return result;
  } catch (error) {
    console.error(
      `[AutopilotDiscoveryQueue] Discovery failed for agent "${agent.agentName}":`,
      error,
    );
    throw error;
  }
});

autopilotDiscoveryQueue.on('completed', (job, result) => {
  const agentName = job.data.agent?.agentName || job.data.agent?._id;
  console.log(
    `[AutopilotDiscoveryQueue] Discovery for agent "${agentName}" completed. Processed: ${result?.processed || 0}`,
  );
});

autopilotDiscoveryQueue.on('failed', (job, err) => {
  const agentName = job.data.agent?.agentName || job.data.agent?._id;
  console.error(
    `[AutopilotDiscoveryQueue] Discovery for agent "${agentName}" FAILED: ${err.message}`,
  );
});

export const addAutopilotDiscoveryJob = async (agent, force = false) => {
  return autopilotDiscoveryQueue.add(
    { agent, force },
    {
      jobId: `autopilot-discovery-${agent._id}-${Date.now()}`,
    },
  );
};

export default autopilotDiscoveryQueue;
