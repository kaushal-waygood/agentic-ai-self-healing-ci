import fs from 'fs';
import path from 'path';
import os from 'os';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { CVDataPrompt } from '../prompt/studentCVData.js';
import { retryOperation } from '../utils/retry.js';
import { callGenAI } from '../utils/genAIWrapper.js';
import { parseBasicFromText } from '../utils/basicParser.js';
import { uploadBufferToCloudinary } from '../middlewares/multer.js';
import redisClient from '../config/redis.js';

// Import Models
import { Student } from '../models/students/student.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';

// --- Helper: Normalize Employment Type to match Schema Enum ---
const normalizeEmploymentType = (type) => {
  if (!type) return 'FULL-TIME';

  // Convert "Full-time", "full_time", "Full Time" -> "FULL-TIME"
  const upper = type.toUpperCase().replace('_', '-').replace(' ', '-');

  const validTypes = ['FULL-TIME', 'PART-TIME', 'INTERNSHIP', 'CONTRACT'];

  // Check strict match or partial match
  if (validTypes.includes(upper)) return upper;

  // Fallback mappings
  if (upper.includes('FULL') && upper.includes('TIME')) return 'FULL-TIME';
  if (upper.includes('PART') && upper.includes('TIME')) return 'PART-TIME';

  return 'FULL-TIME'; // Default
};

export const extractStudentDataFromCV = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file || !req.file.buffer)
      return res.status(400).json({ error: 'No CV uploaded' });

    // 1. Upload to Cloudinary
    let cvUrl = null;
    try {
      const originalName = (
        req.file.originalname || `cv-${Date.now()}`
      ).replace(/\s+/g, '-');
      const publicId = `cvs/${userId}-${Date.now()}-${path.basename(
        originalName,
        path.extname(originalName),
      )}`;

      const cloudResult = await uploadBufferToCloudinary(req.file.buffer, {
        resource_type: 'raw',
        public_id: publicId,
        folder: 'cvs',
        overwrite: false,
        chunk_size: 6000000,
      });
      cvUrl = cloudResult?.secure_url || cloudResult?.url || null;
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, continuing...', cloudErr.message);
    }

    // 2. Parse PDF
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
    const tmpFilePath = path.join(tmpDir, `${userId}-${Date.now()}.pdf`);
    fs.writeFileSync(tmpFilePath, req.file.buffer);

    let pdfText = '';
    try {
      const dataBuffer = fs.readFileSync(tmpFilePath);
      const pdfData = await pdfParse(dataBuffer);
      pdfText = pdfData.text;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid PDF or unreadable CV' });
    } finally {
      try {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
      } catch {}
    }

    // 3. Extract Data (AI + Fallback)
    let extractedData = null;
    try {
      // AI Attempt
      const prompt = CVDataPrompt(pdfText);
      const aiResponse = await retryOperation(
        () =>
          callGenAI(prompt, {
            userId: req.user?._id,
            endpoint: req.originalUrl || 'cv_extract',
          }),
        { retries: 3, baseDelay: 800 },
      );

      console.log(aiResponse);

      const cleaned = String(aiResponse)
        .replace(/```json|```/g, '')
        .trim();
      const parsedJson = JSON.parse(cleaned);

      extractedData = mapAiResponseToSchema(userId, parsedJson);
    } catch (aiErr) {
      console.warn('AI failed, using fallback:', aiErr);
      // Fallback Attempt
      const basicData = parseBasicFromText(pdfText);
      extractedData = mapFallbackToSchema(userId, basicData);
    }

    // 4. Save Data to Separate Collections

    // A. Update Student Profile (Personal Info Only)
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
      ...(extractedData.jobPreferences && {
        jobPreferences: extractedData.jobPreferences,
      }),
      ...(cvUrl && { resumeUrl: cvUrl }),
      hasCompletedOnboarding: true,
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      userId,
      studentUpdate,
      { new: true },
    );

    // B. Wipe Old Relational Data (To ensure clean state)
    await Promise.all([
      StudentEducation.deleteMany({ student: userId }),
      StudentExperience.deleteMany({ student: userId }),
      StudentSkill.deleteMany({ student: userId }),
      StudentProject.deleteMany({ student: userId }),
    ]);

    // C. Insert New Relational Data
    if (extractedData.education.length)
      await StudentEducation.insertMany(extractedData.education);
    if (extractedData.experience.length)
      await StudentExperience.insertMany(extractedData.experience);
    if (extractedData.skills.length)
      await StudentSkill.insertMany(extractedData.skills);
    if (extractedData.projects.length)
      await StudentProject.insertMany(extractedData.projects);

    // 5. Cache Invalidation
    try {
      if (redisClient.invalidateStudentCache)
        await redisClient.invalidateStudentCache(userId);
    } catch (e) {
      console.warn('Cache clear failed');
    }

    // 6. Return Compound Data
    return res.json({
      success: true,
      data: {
        student: updatedStudent,
        education: extractedData.education,
        experience: extractedData.experience,
        skills: extractedData.skills,
        projects: extractedData.projects,
      },
    });
  } catch (err) {
    console.error('CV Extraction Error:', err);
    return res.status(500).json({ error: err.message || 'Extraction failed' });
  }
};

// --- Helper Mappers ---

function mapAiResponseToSchema(userId, json) {
  console.log('json', json);
  return {
    personalInfo: {
      fullName: json.fullName || json.name || '',
      phone: json.phone || '',
      location: json.location || '',
      jobRole: json.jobRole || json.currentRole || '',
    },
    education: (json.education || []).map((item) => ({
      student: userId,
      educationId: uuidv4(),
      institute: item.institute || '',
      degree: item.degree || '',
      fieldOfStudy: item.fieldOfStudy || '',
      startDate: item.startDate || item.startYear || '',
      endDate: item.endDate || item.endYear || '',
      grade: item.grade || '',
      isCurrentlyStudying: !!item.isCurrentlyStudying,
    })),
    experience: (json.experience || []).map((item) => ({
      student: userId,
      experienceId: uuidv4(),
      company: item.company || '',
      title: item.title || '',
      location: item.location || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      description: item.description || '',
      experienceYrs: Number(item.experienceYrs) || 0,
      currentlyWorking: !!item.currentlyWorking,
      // Fix: Normalize Enum
      employmentType: normalizeEmploymentType(item.employmentType),
    })),
    skills: (json.skills || []).map((item) => {
      const skillName = typeof item === 'string' ? item : item.skill;
      const rawLevel =
        typeof item === 'object' && item.level
          ? item.level.toUpperCase()
          : 'INTERMEDIATE';
      const validLevel = [
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED',
        'EXPERT',
      ].includes(rawLevel)
        ? rawLevel
        : 'INTERMEDIATE';
      return {
        student: userId,
        skillId: uuidv4(),
        skill: skillName || 'Unknown',
        level: validLevel,
      };
    }),
    projects: (json.projects || []).map((item) => ({
      student: userId,
      projectName: item.projectName || '',
      description: item.description || '',
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      link: item.link || '',
      // Fix: Projects use Date objects
      startDate: item.startDate ? new Date(item.startDate) : null,
      endDate: item.endDate ? new Date(item.endDate) : null,
    })),
    jobPreferences: json.jobPreferences || {},
  };
}

function mapFallbackToSchema(userId, basicData) {
  return {
    personalInfo: basicData?.personalInfo || {},
    education: [],
    experience: [],
    skills: (basicData?.skills || []).map((s) => ({
      student: userId,
      skillId: uuidv4(),
      skill: typeof s === 'string' ? s : s.skill || 'Unknown',
      level: 'INTERMEDIATE',
    })),
    projects: [],
    jobPreferences: {},
  };
}
