import { __dirname } from '../utils/fileUploadingManaging.js';
import pdfParse from 'pdf-parse';
import { genAIRequest as genAI } from '../config/gemini.js';
import { convertToHTMLPrompt } from '../prompt/convertToHTML.js';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/students/student.model.js';
import { initiateCVGeneration } from '../utils/generateCVCore.js';
import { initiateCoverLetterGeneration } from '../utils/generateCoverLetterCore.js';
import { calculateJobMatch } from '../utils/calculateJobMatch.js';
import {
  generateCLRegeneratePrompt,
  generateCVRegeneratePrompt,
} from '../prompt/generateCVPrompt.js';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import mongoose from 'mongoose';
import { processTailoredApplication } from '../utils/tailoredApply.background.js';
import { StudentCV } from '../models/students/studentCV.model.js';
import { StudentCL } from '../models/students/studentCL.model.js';
import { StudentCoverLetter } from '../models/students/studentCoverLetter.model.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { StudentHtmlCV } from '../models/students/studentHtmlCV.model.js';
import { parseCVData } from './rough.js';
import { computeATS } from '../utils/calculateATSScore.js';
import axios from 'axios';
import { CV_TEMPLATES } from '../utils/cv/cssTemplates.js';

import pdf from 'pdf-parse';
import redisClient from '../config/redis.js';
import { resolveUser } from '../utils/credits.js';
import { User } from '../models/User.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';
import {
  generateEmailPrompt,
  parseEmailDraftResponse,
} from '../prompt/generateEmail.js';
import { wrapEmailHtml, wrapEmailDraftHtml } from '../utils/emailTemplate.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';

/**
 * Extract plain text from an uploaded file (PDF, DOCX, TXT)
 * @param {Object} file - Multer file object (memory storage)
 * @returns {Promise<string>}
 */

async function runOCR(buffer) {
  const {
    data: { text },
  } = await Tesseract.recognize(buffer, 'eng', {
    logger: () => {}, // silence logs
  });

  return text || '';
}

export async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    throw new Error('No file buffer provided');
  }

  const { mimetype, buffer, originalname } = file;

  // ---------- PDF ----------
  if (mimetype === 'application/pdf') {
    const data = await pdf(buffer);

    // ✅ Text-based PDF
    if (data.text && data.text.trim().length > 50) {
      return normalizeText(data.text);
    }

    // 🔥 Scanned PDF → OCR fallback
    const ocrText = await runOCR(buffer);
    if (!ocrText.trim()) {
      throw new Error('Scanned PDF contains no readable text');
    }
    return normalizeText(ocrText);
  }

  // ---------- DOCX ----------
  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value?.trim()) {
      throw new Error('DOCX contains no extractable text');
    }
    return normalizeText(result.value);
  }

  // ---------- TXT ----------
  if (mimetype === 'text/plain') {
    const text = buffer.toString('utf-8');
    if (!text.trim()) {
      throw new Error('Text file is empty');
    }
    return normalizeText(text);
  }

  // ---------- IMAGES (OCR) ----------
  if (
    mimetype === 'image/png' ||
    mimetype === 'image/jpeg' ||
    mimetype === 'image/jpg'
  ) {
    const ocrText = await runOCR(buffer);
    if (!ocrText.trim()) {
      throw new Error('Image contains no readable text');
    }
    return normalizeText(ocrText);
  }

  throw new Error(`Unsupported file type: ${originalname} (${mimetype})`);
}

/**
 * Basic cleanup to avoid garbage input for AI
 */
function normalizeText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// --------Helper Functions---------

const getModelForType = (type) => {
  switch (type) {
    case 'cv':
      return 'cvs';
    case 'cl': // for Cover Letter
      return 'cls';
    case 'tailored': // for Tailored CV
      return 'tailoredApplications';
    default:
      return null; // Invalid type
  }
};

const extractTextFromBuffer = async (file) => {
  const { buffer, mimetype } = file;
  let extractedText = '';

  if (mimetype === 'application/pdf') {
    const parsedPDF = await pdfParse(buffer);
    extractedText = parsedPDF.text;
  } else if (
    mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    extractedText = result.value;
  } else if (mimetype.startsWith('image/')) {
    const {
      data: { text },
    } = await Tesseract.recognize(buffer, 'eng');
    extractedText = text;
  } else {
    throw new Error(
      'Unsupported file type for CV. Please use PDF, DOCX, or an image.',
    );
  }
  return extractedText;
};

function stripHtmlToText(html = '') {
  if (typeof html !== 'string') return '';
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const withNewlines = withoutScripts
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');
  const noTags = withNewlines.replace(/<[^>]+>/g, '');
  return noTags.replace(/\r?\n\s*\r?\n/g, '\n\n').trim();
}

function extractCvTextFromCvData(cvData) {
  if (!cvData) return '';
  if (typeof cvData === 'string') return cvData.trim();
  // common fields people store
  if (typeof cvData.rawText === 'string' && cvData.rawText.trim())
    return cvData.rawText.trim();
  if (typeof cvData.text === 'string' && cvData.text.trim())
    return cvData.text.trim();
  if (Array.isArray(cvData.sections)) {
    try {
      return cvData.sections
        .map((s) => {
          if (!s) return '';
          if (typeof s === 'string') return s;
          if (typeof s.title === 'string' || typeof s.content === 'string') {
            return [s.title || '', s.content || ''].filter(Boolean).join('\n');
          }
          return '';
        })
        .filter(Boolean)
        .join('\n\n')
        .trim();
    } catch {
      // fall through
    }
  }
  // last resort: stringify
  try {
    return JSON.stringify(cvData);
  } catch {
    return '';
  }
}

async function getCvContentBySavedId(studentId, savedCVId) {
  if (!savedCVId) return null;

  // Load only what we need
  const student = await Student.findById(studentId).select('cvs htmlCV').lean();
  if (!student) throw new Error('Student not found');

  // Try Student.cvs subdoc
  let cvText = null;
  if (Array.isArray(student.cvs) && student.cvs.length) {
    const found = student.cvs.find((d) => String(d._id) === String(savedCVId));
    if (found) {
      cvText = extractCvTextFromCvData(found.cvData);
      if (cvText && cvText.trim()) return cvText.trim();
    }
  }

  // Try Student.htmlCV subdoc
  if (Array.isArray(student.htmlCV) && student.htmlCV.length) {
    const foundHtml = student.htmlCV.find(
      (d) => String(d._id) === String(savedCVId),
    );
    if (foundHtml && typeof foundHtml.html === 'string') {
      cvText = stripHtmlToText(foundHtml.html);
      if (cvText && cvText.trim()) return cvText.trim();
    }
  }

  return null;
}

// -------Controllers -----------

export const convertDataIntoHTML = async (req, res) => {
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const prompt = convertToHTMLPrompt(student);
    const rawText = await genAI(prompt);
    const htmlContent = rawText.replace(/```html|```/g, '');

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error converting data into PDF:', error);
    res.status(500).json({ error: 'Failed to convert data into PDF' });
  }
};

export const getAllCVs = async (req, res) => {
  try {
    const { _id } = req.user;
    const studentCVs = await StudentCV.find({ student: _id }).sort({
      createdAt: -1,
    });

    if (!studentCVs) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ cvs: studentCVs });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ error: 'Failed to retrieve CVs' });
  }
};

export const getAllCLs = async (req, res) => {
  try {
    const { _id } = req.user;
    const studentCLs = await StudentCL.find({ student: _id }).sort({
      createdAt: -1,
    });

    if (!studentCLs) {
      return res.status(404).json({ error: 'User not found' });
    }

    const clsToSort = studentCLs || [];

    res.status(200).json({ cls: clsToSort });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ error: 'Failed to retrieve CVs' });
  }
};

/** Map StudentApplication status to StudentTailoredApplication status format */
const mapAgentStatusToTailored = (status) => {
  if (!status) return 'pending';
  const m = { Draft: 'pending', Applied: 'completed', Failed: 'failed' };
  return m[status] || (status === 'Interviewing' || status === 'Offered' || status === 'Shortlist' ? 'completed' : 'pending');
};

/** Normalize StudentApplication to match StudentTailoredApplication format for frontend */
const normalizeAgentApplication = (app) => ({
  _id: app._id,
  student: app.student,
  jobId: app.job,
  jobTitle: app.jobTitle,
  companyName: app.jobCompany,
  jobDescription: app.jobDescription,
  status: mapAgentStatusToTailored(app.status),
  tailoredCV: app.cvContent ? { cv: app.cvContent } : {},
  tailoredCoverLetter: app.coverLetterContent ? { html: app.coverLetterContent } : {},
  applicationEmail: app.emailContent ? { html: app.emailContent } : {},
  completedAt: app.completedAt,
  createdAt: app.createdAt,
  updatedAt: app.updatedAt,
  flag: 'agent',
});

export const getAllTailoredApplications = async (req, res) => {
  try {
    const { _id } = req.user;

    const [tailoredApps, agentApps] = await Promise.all([
      StudentTailoredApplication.find({ student: _id }).sort({ createdAt: -1 }).lean(),
      StudentApplication.find({ student: _id }).sort({ createdAt: -1 }).lean(),
    ]);

    const normalizedAgent = agentApps.map(normalizeAgentApplication);
    const merged = [...tailoredApps, ...normalizedAgent].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.status(200).json({ tailoredApplications: merged });
  } catch (error) {
    console.error('Error fetching tailored applications:', error);
    res.status(500).json({ error: 'Failed to retrieve tailored applications' });
  }
};

export const getSingleCV = async (req, res) => {
  try {
    const { cvId } = req.params;
    const { _id: userId } = req.user;

    const cv = await StudentCV.findOne({
      student: userId,
      _id: cvId,
    });

    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    res.status(200).json({
      success: true,
      cv,
    });
  } catch (error) {
    console.error('Error fetching CV:', error);
    res.status(500).json({ error: 'Failed to retrieve CV' });
  }
};

export const getSingleCL = async (req, res) => {
  try {
    const { clId } = req.params;
    const { _id: userId } = req.user;

    const studentCL = await StudentCL.findOne({
      student: userId,
      _id: clId,
    });

    if (!studentCL) {
      return res.status(404).json({ error: 'CV not found' });
    }

    res.status(200).json({
      success: true,
      cl: studentCL,
    });
  } catch (error) {
    console.error('Error fetching CV:', error);
    res.status(500).json({ error: 'Failed to retrieve CV' });
  }
};

export const getSingleTailoredApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { _id: userId } = req.user;

    let application = await StudentTailoredApplication.findOne({
      student: userId,
      _id: applicationId,
    }).lean();

    if (!application) {
      const agentApp = await StudentApplication.findOne({
        student: userId,
        _id: applicationId,
      }).lean();
      if (agentApp) {
        application = normalizeAgentApplication(agentApp);
      }
    }

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching tailored application:', error);
    res.status(500).json({ error: 'Application not found' });
  }
};

export const deleteSingleCV = async (req, res) => {
  try {
    const { cvId } = req.params;
    const { _id: userId } = req.user;

    // First find the CV to get file paths
    const student = await StudentCV.deleteOne({ student: userId, _id: cvId });

    res.status(200).json({
      success: true,
      message: 'CV deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
};

export const deleteSingleCL = async (req, res) => {
  try {
    const { clId } = req.params;
    const { _id: userId } = req.user;

    // First find the CV to get file paths
    const student = await StudentCL.deleteOne({ student: userId, _id: clId });

    res.status(200).json({
      success: true,
      message: 'Cover Letter deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
};

export const deleteSingleTailoredApplication = async (req, res) => {
  try {
    const { appId } = req.params;
    const { _id: userId } = req.user;

    const tailoredResult = await StudentTailoredApplication.deleteOne({
      student: userId,
      _id: appId,
    });

    if (tailoredResult.deletedCount === 0) {
      const agentResult = await StudentApplication.deleteOne({
        student: userId,
        _id: appId,
      });
      if (agentResult.deletedCount === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

export const renameHtmlCV = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const { title } = req.body;

    if (!id || !title?.trim()) {
      return res.status(400).json({
        error: 'CV ID and new title are required',
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        error: 'Title must be less than 100 characters',
      });
    }

    const student = await StudentCV.findOneAndUpdate(
      {
        student: _id,
        _id: id,
      },
      {
        cvTitle: title.trim(),
      },
      { new: true },
    );

    if (!student) {
      return res.status(404).json({
        error: 'CV not found or user unauthorized',
      });
    }

    res.json({
      message: 'CV renamed successfully',
      newTitle: title.trim(),
      cvId: id,
    });
  } catch (error) {
    console.error('Error renaming CV:', error);
    res.status(500).json({
      error: 'Failed to rename CV',
    });
  }
};

export const renameCoverLetter = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params; // <-- 1. Get ID from URL params
    const { title } = req.body; // <-- 2. Get 'title' from body

    if (!id || !title?.trim()) {
      // <-- 3. Use new variable names
      return res.status(400).json({
        error: 'Cover letter ID and new title are required',
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        error: 'Title must be less than 100 characters',
      });
    }

    const student = await StudentCL.findOneAndUpdate(
      {
        student: _id,
        _id: id,
      },
      {
        clTitle: title.trim(),
      },
      { new: true },
    );

    if (!student) {
      return res.status(404).json({
        error: 'Cover letter not found or user unauthorized',
      });
    }

    res.json({
      message: 'Cover letter renamed successfully',
      newTitle: title.trim(),
      coverLetterId: id,
    });
  } catch (error) {
    console.error('Error renaming cover letter:', error);
    res.status(500).json({
      error: 'Failed to rename cover letter',
    });
  }
};

export const getStudentCLsFromExtension = async (req, res) => {
  try {
    const { _id } = req.user;
    const studentCLs = await StudentCL.find({
      student: _id,
      flag: 'extension',
    })
      .select('clTitle flag status completedAt')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      studentCLs,
    });
  } catch (error) {
    console.error('Error fetching student CLs:', error);
    res.status(500).json({
      error: 'Failed to fetch student CLs',
    });
  }
};

export const getStudentCVsFromExtension = async (req, res) => {
  try {
    const { _id } = req.user;

    const studentCVs = await StudentCV.find({
      student: _id,
      flag: 'extension',
    })
      .select('cvTitle flag status completedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      studentCVs,
    });
  } catch (error) {
    console.error('Error fetching student CVs:', error);
    res.status(500).json({
      error: 'Failed to fetch student CVs',
    });
  }
};

// CV
export const generateCVByTitle = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Job title is required' });
  }

  const jobTitle = title;
  await initiateCVGeneration(req, res, jobTitle, title);
};

export const generateCVByJD = async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }
  await initiateCVGeneration(req, res, jobDescription);
};

export const generateCVByJobId = async (req, res) => {
  const { jobId } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const jobTitle = job.title;
  await initiateCVGeneration(req, res, job.description, jobTitle);
};

export const getAllTemplates = async (req, res) => {
  const templates = CV_TEMPLATES;
  res.json(templates);
};

export const changeTempateCV = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  const { template } = req.body;

  const templates = CV_TEMPLATES;

  if (!id || !template) {
    return res.status(400).json({ error: 'CV ID and template are required' });
  }

  if (!templates[template]) {
    return res.status(400).json({ error: 'Invalid template' });
  }

  const student = await StudentCV.findOneAndUpdate(
    {
      student: _id,
      _id: id,
    },
    {
      template: template,
      updatedAt: new Date(),
    },
    { new: true },
  );

  if (!student) {
    return res.status(404).json({ error: 'CV not found or user unauthorized' });
  }

  res.json({
    message: 'CV template changed successfully',
    newTemplate: template,
    cvId: id,
  });
};

export const refreshStatus = async (req, res) => {
  const { type, id } = req.params;
  const { _id: userId } = req.user;

  const modelName = getModelForType(type);
  if (!modelName) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    let student;
    modelName === 'cvs'
      ? (student = await StudentCV.find({ student: userId, _id: id }).exec())
      : modelName === 'cls'
        ? (student = await StudentCL.find({
            student: userId,
            _id: id,
          }).exec())
        : (student = await StudentTailoredApplication.find({
            student: userId,
            _id: id,
          }).exec());

    if (!student || student.length === 0) {
      return res
        .status(404)
        .json({ error: `Item with id ${id} not found for this student.` });
    }

    // Get the single item from the array
    const item = student[0];

    res.status(200).json({ success: true, item: item });
  } catch (error) {
    console.error(`Error refreshing status for ${type}:`, error);
    res.status(500).json({ error: `Failed to retrieve ${type}` });
  }
};

export const regenerateCV = async (req, res) => {
  try {
    const { _id } = req.user;
    const studentData = await Student.findById(_id);
    const { jobContextString, finalTouch, previousCVJson } = req.body;

    if (!jobContextString || !studentData || !previousCVJson) {
      return res.status(400).json({
        error:
          'jobContextString, studentData, and previousCVJson are required for regeneration.',
      });
    }

    // --- Step 1: Create the regeneration prompt ---
    const prompt = generateCVRegeneratePrompt(
      jobContextString,
      studentData,
      finalTouch, // This can be null or undefined
      previousCVJson,
    );

    // --- Step 2: Generate, Clean, Parse, and Respond ---
    const rawJsonResponse = await genAI(prompt, {
      userId: req.user?._id,
      endpoint: req.endpoint,
    });
    const cleanedJsonString = rawJsonResponse
      .replace(/```json|```/g, '')
      .trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error('Error parsing JSON from AI on regeneration:', error);
      console.error('Raw AI Response:', cleanedJsonString);
      return res
        .status(500)
        .json({ error: 'Failed to parse AI response on regeneration' });
    }

    return res.json(parsedJson);
  } catch (error) {
    console.error('Error in CV regeneration:', error);
    return res.status(500).json({ error: 'Failed to regenerate CV' });
  }
};

export const regenerateCL = async (req, res) => {
  try {
    const { _id } = req.user;
    const studentData = await Student.findById(_id);
    const {
      jobContextString,
      finalTouch,
      currentContent: previousCLJson,
    } = req.body;

    const prompt = generateCLRegeneratePrompt(
      jobContextString,
      studentData,
      finalTouch,
      previousCLJson,
    );

    const rawJsonResponse = await genAI(prompt, {
      userId: req.user?._id,
      endpoint: req.endpoint,
    });
    const cleanedJsonString = rawJsonResponse
      .replace(/```json|```/g, '')
      .trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error('Error parsing JSON from AI on CL regeneration:', error);
      console.error('Raw AI Response:', cleanedJsonString);
      return res
        .status(500)
        .json({ error: 'Failed to parse AI response on CL regeneration' });
    }

    return res.json(parsedJson);
  } catch (error) {
    console.error('Error in CL regeneration:', error);
    return res.status(500).json({ error: 'Failed to regenerate CL' });
  }
};

// Cover letter
export const generateCoverLetterByTitle = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Job title is required' });
  }
  await initiateCoverLetterGeneration(req, res, title);
};

export const generateCoverLetterByJD = async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }
  await initiateCoverLetterGeneration(req, res, jobDescription);
};

export const generateCoverLetterByJobId = async (req, res) => {
  const { jobId } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }
  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  await initiateCoverLetterGeneration(req, res, job.description);
};

export const deleteSingleStudentSavedCV = async (req, res) => {
  const { studentId, cvId } = req.params;
  try {
    const cv = await StudentHtmlCV.findByIdAndDelete(cvId);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }
    return res.json({ success: true, message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return res.status(500).json({ error: 'Failed to delete CV' });
  }
};

export const deleteSingleStudentSavedCL = async (req, res) => {
  const { studentId, clId } = req.params;
  try {
    const cl = await StudentCoverLetter.findByIdAndDelete(clId);
    if (!cl) {
      return res.status(404).json({ error: 'CL not found' });
    }

    return res.json({ success: true, message: 'CL deleted successfully' });
  } catch (error) {
    console.error('Error deleting CL:', error);
    return res.status(500).json({ error: 'Failed to delete CL' });
  }
};

export const saveStudentHTMLCV = async (req, res) => {
  const { _id: studentId } = req.user;
  const { html, title, ats, template } = req.body;

  try {
    const htmlString = typeof html === 'object' && html?.cv ? html.cv : html;

    if (!htmlString || typeof htmlString !== 'string') {
      return res.status(400).json({ error: 'Invalid HTML content' });
    }

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid title' });
    }

    const cv = await StudentHtmlCV.create({
      student: studentId,
      html: htmlString,
      htmlCVTitle: title,
      ats,
      template,
    });

    return res.json({
      success: true,
      message: 'HTML CV saved successfully',
      data: cv,
    });
  } catch (error) {
    console.error('Error saving HTML CV:', error);
    return res.status(500).json({
      error: 'Failed to save HTML CV',
      message: error.message,
    });
  }
};

export const renameSavedStudentCV = async (req, res) => {
  const { _id: studentId } = req.user;
  const { cvId } = req.params;
  const { title } = req.body;

  if (mongoose.Types.ObjectId.isValid(cvId) === false) {
    return res.status(400).json({ error: 'Invalid CV ID' });
  }

  try {
    const cv = await StudentHtmlCV.findOneAndUpdate(
      {
        _id: cvId,
        student: studentId,
      },
      {
        htmlCVTitle: title,
      },
      {
        new: true,
      },
    );

    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    return res.json({
      success: true,
      message: 'HTML CV renamed successfully',
      data: cv,
    });
  } catch (error) {
    console.error('Error renaming HTML CV:', error);
    return res.status(500).json({
      error: 'Failed to rename HTML CV',
      message: error.message,
    });
  }
};

export const renameSavedStudentCL = async (req, res) => {
  const { _id: studentId } = req.user;
  const { clId } = req.params;
  const { title } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clId)) {
    return res.status(400).json({ error: 'Invalid CL ID' });
  }

  try {
    const cl = await StudentCoverLetter.findOneAndUpdate(
      {
        _id: clId,
        student: studentId,
      },
      {
        coverLetterTitle: title,
      },
      {
        new: true,
      },
    );

    if (!cl) {
      return res.status(404).json({ error: 'CL not found' });
    }

    return res.json({
      success: true,
      message: 'HTML CL renamed successfully',
      data: cl,
    });
  } catch (error) {
    console.error('Error renaming HTML CL:', error);
    return res.status(500).json({
      error: 'Failed to rename HTML CL',
      message: error.message,
    });
  }
};

export const getStudentHTMLCV = async (req, res) => {
  const { _id: studentId } = req.user;

  try {
    const cvs = await StudentHtmlCV.find({ student: studentId }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: cvs.length,
      html: cvs,
    });
  } catch (error) {
    console.error('Error getting HTML CV:', error);
    return res.status(500).json({
      error: 'Failed to get HTML CV',
    });
  }
};

export const getSingleStudentHTMLCV = async (req, res) => {
  const { _id: studentId } = req.user;
  const { cvId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cvId)) {
    return res.status(400).json({ error: 'Invalid CV ID' });
  }

  try {
    const cv = await StudentHtmlCV.findOne({
      _id: cvId,
      student: studentId,
    });

    if (!cv) {
      return res.status(404).json({ error: 'HTML CV not found' });
    }

    return res.json({
      success: true,
      html: cv,
    });
  } catch (error) {
    console.error('Error getting HTML CV:', error);
    return res.status(500).json({
      error: 'Failed to get HTML CV',
    });
  }
};

export const savedStudentHTMLLetter = async (req, res) => {
  const { _id: studentId } = req.user;
  const { html, title } = req.body;

  try {
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'Invalid HTML content' });
    }

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid title' });
    }

    const letter = await StudentCoverLetter.create({
      student: studentId,
      coverLetter: html,
      coverLetterTitle: title,
    });

    return res.json({
      success: true,
      message: 'HTML Letter saved successfully',
      data: letter,
    });
  } catch (error) {
    console.error('Error saving HTML Letter:', error);
    return res.status(500).json({
      error: 'Failed to save HTML Letter',
      message: error.message,
    });
  }
};

export const getStudentHTMLLetter = async (req, res) => {
  const { _id: studentId } = req.user;

  try {
    const letters = await StudentCoverLetter.find({
      student: studentId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: letters.length,
      html: letters,
    });
  } catch (error) {
    console.error('Error getting HTML Letter:', error);
    return res.status(500).json({
      error: 'Failed to get HTML Letter',
    });
  }
};

export const getSingleStudentHTMLLetter = async (req, res) => {
  const { _id: studentId } = req.user;
  const { letterId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(letterId)) {
    return res.status(400).json({ error: 'Invalid Letter ID' });
  }

  try {
    const letter = await StudentCoverLetter.findOne({
      _id: letterId,
      student: studentId,
    });

    if (!letter) {
      return res.status(404).json({ error: 'HTML Letter not found' });
    }

    return res.json({
      success: true,
      html: letter,
    });
  } catch (error) {
    console.error('Error getting HTML Letter:', error);
    return res.status(500).json({
      error: 'Failed to get HTML Letter',
    });
  }
};

export const createTailoredApply = async (req, res) => {
  const { _id } = req.user;
  const {
    jobId,
    jobTitle,
    companyName,
    jobDescription,
    useProfile,
    savedCVId,
    savedCoverLetterId,
    coverLetterText,
    finalTouch,
    flag,
  } = req.body;

  try {
    let jobDetails;

    // 1. Resolve Job Details
    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: 'Invalid Job ID format' });
      }
      const jobFromDb = await Job.findById(jobId).lean();
      if (!jobFromDb) return res.status(404).json({ error: 'Job not found' });

      jobDetails = {
        title: jobFromDb.title || 'Untitled',
        company: jobFromDb.company || 'Unknown',
        description: jobFromDb.description || '',
      };
    } else if (jobTitle && companyName && jobDescription) {
      jobDetails = {
        title: jobTitle,
        company: companyName,
        description: jobDescription,
      };
    } else if (req.files?.jobDescriptionFile?.[0]) {
      const jdFile = req.files.jobDescriptionFile[0];
      const extractedText = await extractTextFromFile(jdFile);
      jobDetails = {
        title: jobTitle || 'Untitled Role',
        company: companyName || 'Unknown',
        description: extractedText,
      };
    } else {
      return res.status(400).json({ error: 'Job info required.' });
    }

    // 2. Resolve Student Data
    let studentData = null;
    let cvContent = null;
    const wantsProfile = useProfile === 'true' || useProfile === true;

    if (wantsProfile) {
      // Fetch everything to prevent empty arrays
      const [student, edu, exp, skills, proj] = await Promise.all([
        Student.findById(_id).lean(),
        StudentEducation.find({ student: _id }).lean(),
        StudentExperience.find({ student: _id }).lean(),
        StudentSkill.find({ student: _id }).lean(),
        StudentProject.find({ student: _id }).lean(),
      ]);

      if (!student) return res.status(404).json({ error: 'Student not found' });

      studentData = {
        ...student,
        education: edu || [],
        experience: exp || [],
        skills: skills || [],
        projects: proj || [],
      };
    } else if (savedCVId) {
      const savedCV = await StudentHtmlCV.findOne({
        _id: savedCVId,
        student: _id,
      });
      if (!savedCV)
        return res.status(404).json({ error: 'Saved CV not found' });
      cvContent = savedCV.html;
    } else if (req.files?.cv?.[0]) {
      cvContent = await extractTextFromFile(req.files.cv[0]);
    }

    if (!studentData && !cvContent) {
      return res.status(400).json({ error: 'A CV source is required.' });
    }

    // 3. Create Database Entry
    const newApplication = await StudentTailoredApplication.create({
      student: _id,
      jobId: jobId || null,
      jobTitle: jobDetails.title,
      companyName: jobDetails.company,
      jobDescription: jobDetails.description,
      useProfile: wantsProfile,
      savedCVId: savedCVId || null,
      status: 'pending',
      flag,
    });

    const applicationData = {
      job: jobDetails,
      candidate: studentData ?? { cv: cvContent },
      coverLetter: coverLetterText || '',
      preferences: finalTouch || '',
    };

    const io = req.app?.get?.('io') ?? null;

    // Trigger background process
    processTailoredApplication(
      _id,
      newApplication._id,
      applicationData,
      io,
    ).catch((err) => console.error('Background Job Failed:', err));

    return res.status(202).json({
      success: true,
      applicationId: newApplication._id.toString(),
    });
  } catch (error) {
    console.error('Error initiating tailored application:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Generate a professional email draft for a job application.
 * POST body: { jobId } OR { jobTitle, companyName, jobDescription }
 * Uses authenticated user's profile as candidate.
 */
export const generateEmailDraft = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { jobId, jobTitle, companyName, jobDescription } = req.body || {};

    let job = { title: '', company: '', description: '' };
    if (jobId) {
      const doc = await Job.findById(jobId).select('title company description').lean();
      if (!doc) return res.status(404).json({ error: 'Job not found' });
      job = { title: doc.title, company: doc.company, description: doc.description || '' };
    } else if (jobTitle && companyName) {
      job = {
        title: jobTitle,
        company: companyName,
        description: jobDescription || '',
      };
    } else {
      return res.status(400).json({
        error: 'Provide jobId or (jobTitle, companyName). jobDescription is optional.',
      });
    }

    const snapshot = await getStudentProfileSnapshot(userId);
    if (!snapshot) return res.status(404).json({ error: 'Student profile not found' });

    const candidate = {
      fullName: snapshot.fullName,
      email: snapshot.email,
      phone: snapshot.phone,
      location: snapshot.location,
      education: snapshot.education || [],
      experience: snapshot.experience || [],
      skills: snapshot.skills || [],
      projects: snapshot.projects || [],
    };

    const prompt = generateEmailPrompt({ job, candidate });
    const raw = await genAI(prompt);
    const parsed = parseEmailDraftResponse(raw);

    const subject = parsed.subject || `Application for ${job.title}`;
    const body = parsed.body || '';
    const signature = parsed.signature || snapshot.fullName;

    const bodyHtml = wrapEmailDraftHtml(body, signature);

    return res.status(200).json({
      success: true,
      emailDraft: {
        subject,
        body,
        signature,
        bodyHtml,
      },
    });
  } catch (err) {
    console.error('[generateEmailDraft]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate email draft',
    });
  }
};

export const saveTailoredApplication = async (req, res) => {
  const studentId = req.user._id;
  const {
    jobTitle,
    jobCompany,
    jobDescription,
    cvContent,
    coverLetterContent,
    emailContent,
  } = req.body;

  if (
    !jobTitle ||
    !jobCompany ||
    !jobDescription ||
    !cvContent ||
    !coverLetterContent ||
    !emailContent
  ) {
    return res
      .status(400)
      .json({ message: 'Missing required application data.' });
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 2. Find an existing application by title and company to update it
    const existingApplication = student.applications.find(
      (app) => app.jobTitle === jobTitle && app.jobCompany === jobCompany,
    );

    if (existingApplication) {
      // If found, update its content
      existingApplication.cvContent = cvContent;
      existingApplication.coverLetterContent = coverLetterContent;
      existingApplication.emailContent = emailContent;
    } else {
      // 3. If not found, create a new application with the full job details
      const newApplication = {
        jobTitle,
        jobCompany,
        jobDescription,
        cvContent,
        coverLetterContent,
        emailContent,
      };
      student.applications.push(newApplication);
    }

    // 4. Save the changes to the database
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Application saved successfully.',
    });
  } catch (error) {
    console.error('Error saving tailored application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSavedApplications = async (req, res) => {
  const studentId = req.user._id;

  try {
    // 1. Find the student by their ID and select only the 'applications' field
    const student = await Student.findById(studentId).select('applications');

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 2. Return the array of applications
    res.status(200).json({
      success: true,
      applications: student.applications,
    });
  } catch (error) {
    console.error('Error fetching saved applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Convert parsed CV data (from parseCVData) to student format for calculateJobMatch
 */
function parsedCvToStudentForMatch(parsed) {
  const experience = parsed.experience || [];
  const totalExperienceYears = experience.reduce(
    (sum, exp) => sum + (Number(exp.experienceYrs) || 0),
    0,
  );
  return {
    skills: (parsed.skills || []).map((s) => ({
      skill: typeof s === 'string' ? s : s.skill || '',
    })),
    experience: experience.map((e) => ({
      description: e.description || '',
    })),
    education: parsed.education || [],
    projects: parsed.projects || [],
    totalExperienceYears: Math.round(totalExperienceYears * 10) / 10,
  };
}

/**
 * Strip HTML tags to get plain text for CV parsing
 */
// function stripHtmlToText(html) {
//   if (!html || typeof html !== 'string') return '';
//   return html
//     .replace(/<[^>]+>/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

export const calculateJobMatchScore = async (req, res) => {
  try {
    const { jobDescription, jobTitle, useProfile, savedCVId } = req.body;
    if (!jobDescription)
      return res.status(400).json({ error: 'Job description required' });

    const user = await resolveUser(req.user._id);
    let student;

    if (savedCVId) {
      if (!mongoose.Types.ObjectId.isValid(savedCVId)) {
        return res.status(400).json({ error: 'Invalid savedCVId' });
      }
      const saved = await StudentHtmlCV.findOne({
        _id: savedCVId,
        student: req.user._id,
      });
      if (!saved) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }
      const html = saved.html || saved.content || saved.htmlCV;
      if (!html || typeof html !== 'string' || !html.trim()) {
        return res
          .status(422)
          .json({ error: 'Saved CV has no usable content' });
      }
      const text = stripHtmlToText(html);
      if (!text || text.length < 50) {
        return res
          .status(422)
          .json({ error: 'Could not extract enough text from saved CV' });
      }
      const parsed = await parseCVData(text, req.user._id);
      student = parsedCvToStudentForMatch(parsed);
    } else {
      const studentDetails = await Student.findById(req.user._id).lean();
      const skills = await StudentSkill.find({ student: req.user._id }).lean();
      const experience = await StudentExperience.find({
        student: req.user._id,
      }).lean();
      const education = await StudentEducation.find({
        student: req.user._id,
      }).lean();
      const projects = await StudentProject.find({
        student: req.user._id,
      }).lean();

      student = {
        ...studentDetails,
        skills,
        experience,
        education,
        projects,
      };
    }

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await calculateJobMatch(
      jobDescription,
      student,
      jobTitle || '',
    );

    if (result) {
      try {
        await User.updateOne(
          { _id: req.user._id },
          { $inc: { 'usageCounters.jobMatching': 1 } },
        );
      } catch (incErr) {
        console.error(
          `Failed to increment usage for user ${req.user._id}:`,
          incErr,
        );
      }
    }

    return res.json(result);
  } catch (err) {
    console.error('JobMatch Error:', err);
    return res.status(500).json({ error: 'Failed to calculate match score' });
  }
};

export const calculateATS = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription)
      return res.status(400).json({ error: 'Job Description required' });

    const studentDetails = await Student.findById(req.user._id).lean();
    const skills = await StudentSkill.find({ student: req.user._id }).lean();
    const experience = await StudentExperience.find({
      student: req.user._id,
    }).lean();
    const education = await StudentEducation.find({
      student: req.user._id,
    }).lean();
    const projects = await StudentProject.find({
      student: req.user._id,
    }).lean();

    const student = {
      ...studentDetails,
      skills,
      experience,
      education,
      projects,
    };

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await computeATS(jobDescription, student);

    return res.json(result);
  } catch (err) {
    console.error('ATS Error:', err);
    return res.status(500).json({ error: 'ATS scoring failed' });
  }
};

export const getDocumentCounts = async (req, res) => {
  const { _id: studentId } = req.user;

  try {
    const [
      generatedCVCount,
      savedCVCount,
      generatedCLCount,
      savedCLCount,
      tailoredCount,
      agentAppCount,
    ] = await Promise.all([
      // CV Counts
      StudentCV.countDocuments({ student: studentId }),
      StudentHtmlCV.countDocuments({ student: studentId }),

      // Cover Letter Counts
      StudentCL.countDocuments({ student: studentId }),
      StudentCoverLetter.countDocuments({ student: studentId }),

      // Tailored Application Counts (manual flow)
      StudentTailoredApplication.countDocuments({ student: studentId }),
      // Agent-generated applications
      StudentApplication.countDocuments({ student: studentId }),
    ]);

    const totalTailored = tailoredCount + agentAppCount;

    const stats = {
      cv: {
        generated: generatedCVCount,
        saved: savedCVCount,
        total: generatedCVCount + savedCVCount,
      },
      cl: {
        generated: generatedCLCount,
        saved: savedCLCount,
        total: generatedCLCount + savedCLCount,
      },
      tailored: {
        generated: totalTailored,
        total: totalTailored,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching document counts:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
};
