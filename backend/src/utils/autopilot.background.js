import fs from 'fs';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { extractTextFromCV, parseCVData } from '../controllers/rough.js';
import { v4 as uuidv4 } from 'uuid';
import {
  sendRealTimeUserNotification,
  notificationTemplates,
} from './notification.utils.js';

const id = () => uuidv4();

export const processAutopilotAgent = async (studentId, agentId, file, io) => {
  try {
    let uploadedCVData = null;

    if (file) {
      const buffer = fs.readFileSync(file.path);
      const text = await extractTextFromCV({ buffer, mimetype: file.mimetype });
      const parsed = await parseCVData(text, studentId);

      uploadedCVData = {
        jobRole: parsed.jobRole || '',
        skills:
          parsed.skills?.map((s) => ({
            skillId: id(),
            skill: s.skill || s.name,
            level: s.level || 'INTERMEDIATE',
          })) || [],
        experience:
          parsed.experience?.map((e) => ({
            experienceId: id(),
            company: e.company,
            title: e.title,
            employmentType: e.employmentType,
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.description,
          })) || [],
        education:
          parsed.education?.map((e) => ({
            educationId: id(),
            institute: e.institute,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
          })) || [],
        projects: parsed.projects || [],
      };

      fs.unlinkSync(file.path);
    }

    const updated = await StudentAgent.findOneAndUpdate(
      { agentId },
      { status: 'completed', uploadedCVData, updatedAt: new Date() },
    );

    console.log('Autopilot completed', updated);

    if (io) {
      await sendRealTimeUserNotification(
        io,
        studentId,
        notificationTemplates.GENERAL_SUCCESS(
          'Autopilot Ready',
          'Your AI agent is now live',
        ),
      );
    }
  } catch (error) {
    await StudentAgent.findOneAndUpdate(
      { agentId },
      { status: 'failed', error: error.message },
    );

    if (io) {
      await sendRealTimeUserNotification(
        io,
        studentId,
        notificationTemplates.GENERAL_ERROR(
          'Agent failed',
          'CV processing failed',
        ),
      );
    }
  }
};
