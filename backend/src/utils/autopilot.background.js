import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { StudentCV } from '../models/students/studentCV.model.js';
import { StudentHtmlCV } from '../models/students/studentHtmlCV.model.js';
import { extractTextFromCV, parseCVData } from '../controllers/rough.js';
import {
  sendRealTimeUserNotification,
  notificationTemplates,
} from './notification.utils.js';

const id = () => uuidv4();

const toText = (value) => (value ? String(value).trim() : '');

const normalizeUploadedCVData = (parsed) => ({
  jobRole: parsed?.jobRole || parsed?.personalInfo?.jobRole || '',
  skills:
    parsed?.skills?.map((s) => ({
      skillId: id(),
      skill: s?.skill || s?.name || '',
      level: s?.level || 'INTERMEDIATE',
    })) || [],
  experience:
    parsed?.experience?.map((e) => ({
      experienceId: id(),
      company: e?.company || '',
      title: e?.title || e?.role || '',
      employmentType: e?.employmentType,
      startDate: e?.startDate,
      endDate: e?.endDate,
      description: e?.description,
      currentlyWorking: !!e?.currentlyWorking,
    })) || [],
  education:
    parsed?.education?.map((e) => ({
      educationId: id(),
      institute: e?.institute || '',
      degree: e?.degree || '',
      fieldOfStudy: e?.fieldOfStudy || '',
      startDate: e?.startDate,
      endDate: e?.endDate,
      grade: e?.grade,
      isCurrentlyStudying: !!e?.isCurrentlyStudying,
    })) || [],
  projects:
    parsed?.projects?.map((project) => ({
      projectName: project?.projectName || '',
      description: project?.description || '',
      technologies: Array.isArray(project?.technologies)
        ? project.technologies
        : [],
      link: project?.link || '',
      startDate: project?.startDate,
      endDate: project?.endDate,
    })) || [],
});

const stripHtmlToText = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractGeneratedSkills = (rawSkills) => {
  if (!rawSkills) return [];

  if (Array.isArray(rawSkills)) {
    return rawSkills
      .map((skill) => ({
        skill: typeof skill === 'string' ? skill : skill?.skill || '',
        level:
          typeof skill === 'string' ? 'INTERMEDIATE' : skill?.level || 'INTERMEDIATE',
      }))
      .filter((skill) => skill.skill);
  }

  if (typeof rawSkills === 'object') {
    return Object.values(rawSkills)
      .flatMap((items) => {
        if (Array.isArray(items)) return items;
        if (typeof items === 'string') {
          return items
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        }
        return [];
      })
      .map((skill) => ({
        skill: typeof skill === 'string' ? skill : skill?.skill || '',
        level:
          typeof skill === 'string' ? 'INTERMEDIATE' : skill?.level || 'INTERMEDIATE',
      }))
      .filter((skill) => skill.skill);
  }

  return [];
};

const normalizeGeneratedCVData = (raw = {}) =>
  normalizeUploadedCVData({
    jobRole:
      toText(raw?.jobTitle) ||
      toText(raw?.headline) ||
      toText(raw?.summaryTitle) ||
      '',
    skills: extractGeneratedSkills(raw?.skills),
    experience: Array.isArray(raw?.experience)
      ? raw.experience.map((entry) => ({
          title: entry?.role || entry?.title || '',
          company: entry?.company || '',
          employmentType: entry?.employmentType || '',
          startDate: entry?.startDate || entry?.dates || '',
          endDate: entry?.endDate || '',
          description: Array.isArray(entry?.bullets)
            ? entry.bullets.join(' ')
            : entry?.description || '',
          currentlyWorking: !!entry?.currentlyWorking,
        }))
      : [],
    education: Array.isArray(raw?.education) ? raw.education : [],
    projects: Array.isArray(raw?.projects) ? raw.projects : [],
  });

const getSelectedCvData = async ({ studentId, agent }) => {
  if (agent?.cvOption !== 'saved_cv' || !agent?.selectedCVId) {
    return null;
  }

  if (agent.selectedCVSource === 'generated') {
    const generatedCv = await StudentCV.findOne({
      _id: agent.selectedCVId,
      student: studentId,
    })
      .select('status cvData')
      .lean();

    if (!generatedCv) {
      throw new Error('Generated CV not found');
    }

    if (generatedCv.status !== 'completed' || !generatedCv.cvData) {
      throw new Error('Generated CV is not ready');
    }

    return normalizeGeneratedCVData(generatedCv.cvData);
  }

  if (agent.selectedCVSource === 'saved') {
    const savedCv = await StudentHtmlCV.findOne({
      _id: agent.selectedCVId,
      student: studentId,
    })
      .select('html')
      .lean();

    if (!savedCv?.html) {
      throw new Error('Saved CV not found');
    }

    const text = stripHtmlToText(savedCv.html);
    if (!text) {
      throw new Error('Saved CV has no usable content');
    }

    const parsed = await parseCVData(text, studentId);
    return normalizeUploadedCVData(parsed);
  }

  throw new Error('Invalid selected CV source');
};

export const processAutopilotAgent = async (studentId, agentId, file, io) => {
  try {
    const agent = await StudentAgent.findOne({ agentId })
      .select('cvOption selectedCVId selectedCVSource')
      .lean();

    let uploadedCVData = null;

    if (file) {
      const buffer = fs.readFileSync(file.path);
      const text = await extractTextFromCV({ buffer, mimetype: file.mimetype });
      const parsed = await parseCVData(text, studentId);
      uploadedCVData = normalizeUploadedCVData(parsed);
      fs.unlinkSync(file.path);
    } else if (agent?.cvOption === 'saved_cv') {
      uploadedCVData = await getSelectedCvData({ studentId, agent });
    }

    await StudentAgent.findOneAndUpdate(
      { agentId },
      { status: 'completed', uploadedCVData, updatedAt: new Date() },
    );

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
  } finally {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};
