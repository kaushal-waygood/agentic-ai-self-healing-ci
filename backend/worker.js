// db-worker.js
import connectDb from './src/config/db.js';
import { Student } from './src/models/student.model.js';
import { AppliedJob } from './src/models/AppliedJob.js';
import { getRecommendedJobs } from './src/utils/getRecommendedJobs.js';

const findAndProcessJobs = async () => {
  console.log('🚀 [Worker] Starting a new job-finding cycle...');

  const students = await Student.find({
    'settings.autopilotEnabled': true,
  });

  console.log(
    `[Worker] Found ${students.length} students with autopilot enabled.`,
  );

  for (const student of students) {
    for (const agent of student.autopilotAgent) {
      try {
        console.log(
          `🔍 Processing agent "${agent.agentName}" for student ${student._id}...`,
        );

        const appliedJobs = await AppliedJob.find({ studentId: student._id });
        const appliedJobIds = appliedJobs.map((job) => job.jobId);

        const agentConfig = agent.toObject();
        delete agentConfig._id;
        delete agentConfig.agentId;
        delete agentConfig.agentName;

        const recommendedJobs = await getRecommendedJobs({
          studentId: student._id,
          agentConfig,
          appliedJobIds,
        });

        if (recommendedJobs.length === 0) {
          console.log(
            `[Worker] No new jobs found for agent "${agent.agentName}".`,
          );
          continue;
        }

        console.log(
          `✅ Found ${recommendedJobs.length} new jobs for agent "${agent.agentName}".`,
        );
      } catch (error) {
        console.error(
          `❌ Failed to process agent "${agent.agentName}":`,
          error.message,
        );
      }
    }
  }
};

const startWorker = async () => {
  await connectDb();
  console.log('✅ DB Worker connected.');

  // ✨ FIX: Remove the loop and just run the process once.
  await findAndProcessJobs();

  console.log('\n✅ Cycle complete. Worker is now exiting.');
  process.exit(0); // Exit the process cleanly
};

startWorker();
