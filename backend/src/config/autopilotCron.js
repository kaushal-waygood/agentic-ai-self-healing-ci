import cron from 'node-cron';
import jobDiscoveryQueue from '../queues/jobDiscoveryQueue.js';
import { Student } from '../models/student.model.js';

const runAutopilotCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running autopilot job discovery cron...');

    // This query is the key. It only finds students who have enabled the feature.
    const studentsWithAutopilot = await Student.find({
      'settings.autopilotEnabled': true,
    });

    console.log(
      `Found ${studentsWithAutopilot.length} students with autopilot enabled.`,
    );

    for (const student of studentsWithAutopilot) {
      await jobDiscoveryQueue.add({ studentId: student._id });
    }
  });
};

export default runAutopilotCron;
