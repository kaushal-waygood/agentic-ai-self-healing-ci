// src/config/autopilotCron.js
import cron from 'node-cron';
import { Student } from '../models/students/student.model.js';
import { Job } from '../models/jobs.model.js'; // Import the new Job model

export const runAutopilotTask = async () => {
  console.log('🚀 [Task] Finding students for job discovery...');
  try {
    const studentsWithAgents = await Student.find({
      'autopilotAgent.autopilotEnabled': true,
      isActive: true,
    }).select('_id autopilotAgent');

    if (!studentsWithAgents || studentsWithAgents.length === 0) {
      console.log('[Task] No students with active autopilot agents found.');
      return;
    }

    const newJobs = [];
    for (const student of studentsWithAgents) {
      for (const agent of student.autopilotAgent) {
        if (agent.autopilotEnabled) {
          // Create a job document instead of a queue payload
          newJobs.push({
            studentId: student._id,
            agentId: agent.agentId,
            agentName: agent.agentName,
          });
        }
      }
    }

    if (newJobs.length > 0) {
      // Use insertMany to efficiently add all new jobs to the database
      await Job.insertMany(newJobs, { ordered: false });
      console.log(
        `✅ [Task] Successfully created ${newJobs.length} jobs in the database.`,
      );
    }
  } catch (error) {
    // Prevents duplicate key errors from stopping the process
    if (error.code === 11000) {
      console.warn('[Task] Some duplicate jobs were ignored.');
    } else {
      console.error('❌ [Task] Error creating jobs:', error);
    }
  }
};

export const scheduleAutopilotTriggers = () => {
  // We'll run this every 5 minutes for more frequent checks
  cron.schedule('*/5 * * * *', runAutopilotTask);
  console.log('🗓️  DB job creation cron job scheduled to run every 5 minutes.');
};
