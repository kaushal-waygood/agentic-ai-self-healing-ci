// src/config/autopilotCron.js
import cron from 'node-cron';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import jobDiscoveryQueue from '../queues/jobDiscoveryQueue.js';
import { runWithCronTelemetry } from '../utils/cronMonitor.js';

export const runAutopilotTask = async () => {
  console.log('🚀 [Task] Finding students for job discovery...');
  try {
    const activeAgents = await StudentAgent.find({
      isAgentActive: true,
      status: 'completed',
    })
      .select('student agentId agentName')
      .lean();

    console.log(activeAgents);

    if (!activeAgents || activeAgents.length === 0) {
      console.log('[Task] No students with active autopilot agents found.');
      return;
    }

    const tasks = activeAgents.map((agent) => ({
      studentId: agent.student,
      agentId: agent.agentId,
      agentName: agent.agentName || agent.agentId,
    }));

    if (tasks.length > 0) {
      await jobDiscoveryQueue.addBulk(tasks.map((t) => ({ data: t })));
      console.log(
        `✅ [Task] Successfully queued ${tasks.length} autopilot tasks for job discovery.`,
      );
    }
  } catch (error) {
    console.error('❌ [Task] Error queuing autopilot tasks:', error);
  }
};

export const scheduleAutopilotTriggers = () => {
  // We'll run this every 5 minutes for more frequent checks
  const schedule = process.env.CRON_AUTOPILOT_DISCOVERY_SCHEDULE || '*/5 * * * *';
  cron.schedule(schedule, () =>
    runWithCronTelemetry('AutopilotDiscovery', runAutopilotTask),
  );
  console.log(
    `🗓️  DB job creation cron job scheduled (${schedule}).`,
  );
};
