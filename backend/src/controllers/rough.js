import fs from 'fs';
import path from 'path';
import os from 'os';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth'; // DOCX Extractor
import Tesseract from 'tesseract.js'; // OCR for Image to Text
import { v4 as uuidv4 } from 'uuid';
import { CVDataPrompt } from '../prompt/studentCVData.js';
import { retryOperation } from '../utils/retry.js';
import { callGenAI } from '../utils/genAIWrapper.js';
import { parseBasicFromText } from '../utils/basicParser.js';
import { uploadBufferToCloudinary } from '../middlewares/multer.js';
import redisClient from '../config/redis.js';

// Models
import { Student } from '../models/students/student.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';

// =======================================================
// Helpers / Utility Blocks
// =======================================================

const normalizeEmploymentType = (type) => {
  if (!type) return 'FULL-TIME';
  const upper = type.toUpperCase().replace('_', '-').replace(' ', '-');
  if (['FULL-TIME', 'PART-TIME', 'INTERNSHIP', 'CONTRACT'].includes(upper))
    return upper;
  if (upper.includes('FULL') && upper.includes('TIME')) return 'FULL-TIME';
  if (upper.includes('PART') && upper.includes('TIME')) return 'PART-TIME';
  return 'FULL-TIME';
};

// ================= Cloudinary Upload =================
async function uploadToCloudinary(req) {
  try {
    const cloud = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'cvs',
      public_id: `${req.user?._id}-${Date.now()}`,
      resource_type: 'image',
      format: 'pdf',
      type: 'upload',
      access_mode: 'public',
      invalidate: true,
    });

    return cloud?.secure_url || cloud?.url || null;
  } catch (err) {
    console.warn('⚠ Cloudinary Upload Failed:', err.message);
    return null;
  }
}

// ================= File → Text Extraction =================
export async function extractTextFromCV(file) {
  const type = file.mimetype;

  if (type === 'application/pdf') {
    const pdf = await pdfParse(file.buffer);
    return pdf.text;
  }

  if (
    type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const doc = await mammoth.extractRawText({ buffer: file.buffer });
    return doc.value;
  }

  if (type === 'application/msword')
    throw { status: 400, message: 'DOC unsupported. Upload PDF/DOCX instead.' };

  if (['image/png', 'image/jpeg'].includes(type)) {
    const ocr = await Tesseract.recognize(file.buffer, 'eng');
    return ocr.data.text;
  }

  throw { status: 400, message: 'Invalid resume format' };
}

// ================= Schema Mapping =================
function mapAiResponseToSchema(userId, json) {
  return {
    personalInfo: {
      fullName: json.fullName || json.name || '',
      phone: json.phone || '',
      location: json.location || '',
      jobRole: json.jobRole || json.currentRole || '',
    },
    education: (json.education || []).map((e) => ({
      student: userId,
      educationId: uuidv4(),
      institute: e.institute || '',
      degree: e.degree || '',
      fieldOfStudy: e.fieldOfStudy || '',
      startDate: e.startDate || e.startYear || '',
      endDate: e.endDate || e.endYear || '',
      grade: e.grade || '',
      isCurrentlyStudying: !!e.isCurrentlyStudying,
    })),
    experience: (json.experience || []).map((x) => ({
      student: userId,
      experienceId: uuidv4(),
      company: x.company || '',
      title: x.title || '',
      location: x.location || '',
      startDate: x.startDate || '',
      endDate: x.endDate || '',
      description: x.description || '',
      experienceYrs: Number(x.experienceYrs) || 0,
      currentlyWorking: !!x.currentlyWorking,
      employmentType: normalizeEmploymentType(x.employmentType),
    })),
    skills: (json.skills || []).map((s) => ({
      student: userId,
      skillId: uuidv4(),
      skill: typeof s === 'string' ? s : s.skill || '',
      level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(
        (s.level || '').toUpperCase(),
      )
        ? s.level.toUpperCase()
        : 'INTERMEDIATE',
    })),
    projects: (json.projects || []).map((p) => ({
      student: userId,
      projectName: p.projectName || '',
      description: p.description || '',
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      link: p.link || '',
      startDate: p.startDate ? new Date(p.startDate) : null,
      endDate: p.endDate ? new Date(p.endDate) : null,
    })),
    jobPreferences: json.jobPreferences || {},
  };
}

function mapFallbackToSchema(userId, basic) {
  return {
    personalInfo: basic?.personalInfo || {},
    education: [],
    experience: [],
    skills: (basic.skills || []).map((s) => ({
      student: userId,
      skillId: uuidv4(),
      skill: typeof s === 'string' ? s : s.skill || 'Unknown',
      level: 'INTERMEDIATE',
    })),
    projects: [],
    jobPreferences: {},
  };
}

// ================= AI + Fallback Parsing =================
export async function parseCVData(text, userId) {
  if (!text.trim()) throw { status: 400, message: 'Could not extract text' };

  try {
    const prompt = CVDataPrompt(text);
    const aiResponse = await retryOperation(
      () => callGenAI(prompt, { userId, endpoint: 'resume-extract' }),
      { retries: 3, baseDelay: 1000 },
    );

    const parsed = JSON.parse(
      String(aiResponse)
        .replace(/```json|```/g, '')
        .trim(),
    );
    return mapAiResponseToSchema(userId, parsed);
  } catch (err) {
    console.warn('⚠ AI failed -> using fallback');
    return mapFallbackToSchema(userId, parseBasicFromText(text));
  }
}

// ================= DB Save =================
async function saveStudentDataToDB(userId, extractedData, cvUrl) {
  const studentUpdate = {
    ...(extractedData.personalInfo.fullName && {
      fullName: extractedData.personalInfo.fullName,
    }),
    ...(extractedData.personalInfo.phone && {
      phone: extractedData.personalInfo.phone,
    }),
    ...(extractedData.personalInfo.location && {
      location: extractedData.personalInfo.location,
    }),
    ...(extractedData.personalInfo.jobRole && {
      jobRole: extractedData.personalInfo.jobRole,
    }),
    jobPreferences: extractedData.jobPreferences,
    ...(cvUrl && { resumeUrl: cvUrl }),
    hasCompletedOnboarding: true,
  };

  await Student.findByIdAndUpdate(userId, studentUpdate, { new: true });
  await Promise.all([
    StudentEducation.deleteMany({ student: userId }),
    StudentExperience.deleteMany({ student: userId }),
    StudentSkill.deleteMany({ student: userId }),
    StudentProject.deleteMany({ student: userId }),
  ]);

  if (extractedData.education.length)
    await StudentEducation.insertMany(extractedData.education);
  if (extractedData.experience.length)
    await StudentExperience.insertMany(extractedData.experience);
  if (extractedData.skills.length)
    await StudentSkill.insertMany(extractedData.skills);
  if (extractedData.projects.length)
    await StudentProject.insertMany(extractedData.projects);
}

// =======================================================
// Main Controller (Final Function)
// =======================================================

export const extractStudentDataFromCV = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file?.buffer)
      return res.status(400).json({ error: 'No CV uploaded' });

    console.log('=== Upload Debug ===');
    console.log(
      'Original:',
      req.file.originalname,
      '| Type:',
      req.file.mimetype,
    );

    const cvUrl = await uploadToCloudinary(req);
    const text = await extractTextFromCV(req.file);
    const extractedData = await parseCVData(text, userId);

    await saveStudentDataToDB(userId, extractedData, cvUrl);
    redisClient.invalidateStudentCache?.(userId);

    res.json({
      success: true,
      resumeUrl: cvUrl,
      data: extractedData,
      message: 'Resume processed successfully',
    });
  } catch (err) {
    console.error('❌ CV Extraction Error:', err);
    res.status(500).json({ error: err.message });
  }
};
