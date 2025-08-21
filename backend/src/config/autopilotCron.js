import cron from 'node-cron';
import { Student } from '../models/student.model.js';
import jobDiscoveryQueue from '../queues/jobDiscoveryQueue.js';

const runAutopilotCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running autopilot job discovery cron...');

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Get all students with active autopilot agents
      const studentsWithAutopilot = await Student.aggregate([
        {
          $match: {
            'autopilotAgent.autopilotEnabled': true,
            isActive: true,
          },
        },
        {
          $lookup: {
            from: 'appliedjobs',
            let: { studentId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$student', '$$studentId'] },
                      { $gte: ['$createdAt', startOfDay] },
                    ],
                  },
                },
              },
              { $count: 'count' },
            ],
            as: 'appliedToday',
          },
        },
        {
          $addFields: {
            appliedToday: {
              $ifNull: [{ $arrayElemAt: ['$appliedToday.count', 0] }, 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            email: 1,
            jobPreferences: 1,
            jobRole: 1,
            skills: 1,
            experience: 1,
            education: 1,
            appliedToday: 1,
            autopilotAgent: 1, // Include all agents, we'll filter later
          },
        },
      ]);

      console.log(
        `Found ${studentsWithAutopilot.length} students with active autopilot agents.`,
      );

      // Process each student and their active agents
      const discoveryJobs = [];

      for (const student of studentsWithAutopilot) {
        // Filter only enabled agents
        const activeAgents = student.autopilotAgent.filter(
          (agent) => agent.autopilotEnabled,
        );

        for (const agent of activeAgents) {
          // Calculate remaining applications for today
          const remainingApplications =
            agent.autopilotLimit - student.appliedToday;

          if (remainingApplications > 0) {
            // Add one job per remaining application
            for (let i = 0; i < remainingApplications; i++) {
              discoveryJobs.push({
                data: {
                  studentId: student._id.toString(),
                  agentId: agent.agentId,
                  agentConfig: {
                    jobTitle: agent.jobTitle,
                    jobLocation: agent.jobLocation,
                    isRemote: agent.isRemote,
                    employmentType: agent.employmentType,
                    cvOption: agent.cvOption,
                    uploadedCVData: agent.uploadedCVData,
                  },
                  studentProfile: {
                    jobPreferences: student.jobPreferences,
                    jobRole: student.jobRole,
                    skills: student.skills,
                    experience: student.experience,
                    education: student.education,
                  },
                },
              });
            }
          }
        }
      }

      console.log(
        `Adding ${discoveryJobs.length} job discovery tasks to queue.`,
      );

      if (discoveryJobs.length > 0) {
        await jobDiscoveryQueue.addBulk(discoveryJobs);
      }
    } catch (error) {
      console.error('Error in autopilot cron job:', error);
    }
  });
};

export default runAutopilotCron;
