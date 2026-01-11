import { __dirname } from '../utils/fileUploadingManaging.js';
import pdfParse from 'pdf-parse';
import { genAIRequest as genAI } from '../config/gemini.js';
import { convertToHTMLPrompt } from '../prompt/convertToHTML.js';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
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
import { computeATS } from '../utils/calculateATSScore.js';
import axios from 'axios';
import { CV_TEMPLATES } from '../utils/cv/cssTemplates.js';

import pdf from 'pdf-parse';
import redisClient from '../config/redis.js';
import { resolveUser } from '../utils/credits.js';
import { User } from '../models/User.model.js';

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

export const getAllTailoredApplications = async (req, res) => {
  try {
    const { _id } = req.user;
    const applications = await StudentTailoredApplication.find({
      student: _id,
    }).sort({
      createdAt: -1,
    });

    if (!applications) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ tailoredApplications: applications });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ error: 'Failed to retrieve CVs' });
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

    const student = await StudentTailoredApplication.findOne({
      student: userId,
      _id: applicationId,
    });

    if (!student) {
      return res.status(404).json({ error: 'CV not found' });
    }

    res.status(200).json({
      success: true,
      application: student,
    });
  } catch (error) {
    console.error('Error fetching CV:', error);
    res.status(500).json({ error: 'Failed to retrieve CV' });
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

    // First find the student to get the tailored application details
    const student = await StudentTailoredApplication.deleteOne({
      student: userId,
      _id: appId,
    });

    if (!student) {
      return res.status(404).json({ error: 'Tailored application not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Tailored application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tailored application:', error);
    res.status(500).json({ error: 'Failed to delete tailored application' });
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
  const { html, title, ats } = req.body;

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

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: 'Invalid Job ID format' });
      }

      const jobFromDb = await Job.findById(jobId).lean();
      if (!jobFromDb) {
        return res.status(404).json({ error: 'Job not found in database' });
      }

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
        company: companyName || 'Unknown Company',
        description: extractedText,
      };
    } else {
      return res.status(400).json({
        error: 'Job info required: jobId, manual JD, or JD file upload',
      });
    }

    let studentData = null;
    let cvContent = null;

    const wantsProfile = useProfile === 'true' || useProfile === true;

    if (wantsProfile) {
      const student = await Student.findById(_id).lean();

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student;
    } else if (savedCVId) {
      const savedCV = await StudentHtmlCV.findOne({
        _id: savedCVId,
        student: _id,
      });
      if (!savedCV) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }
      cvContent = savedCV.html;
      if (!cvContent) {
        return res.status(422).json({ error: 'Saved CV has no content' });
      }
    } else if (req.file) {
      const extractedText = await extractTextFromFile(jdFile); // PDF/DOC parser
      jobDetails = {
        title: jobTitle || 'Untitled Role',
        company: companyName || 'Unknown Company',
        description: extractedText,
      };
    } else {
      return res.status(400).json({
        error:
          'A CV source is required (useProfile=true, savedCVId, or file upload).',
      });
    }

    const newApplication = await StudentTailoredApplication.create({
      student: _id,
      jobId: jobId || null, // Optional if applying to external job
      jobTitle: jobDetails.title,
      companyName: jobDetails.company,
      jobDescription: jobDetails.description,
      useProfile: wantsProfile,
      savedCVId: savedCVId || null,
      savedCoverLetterId: savedCoverLetterId || null,
      coverLetterText: coverLetterText || null,
      finalTouch: finalTouch || null,
      status: 'pending',
      flag,
      createdAt: new Date(),
    });

    const applicationData = {
      job: {
        title: jobDetails.title,
        company: jobDetails.company,
        description: jobDetails.description,
      },
      candidate: studentData ?? { cv: cvContent },
      coverLetter: coverLetterText || '',
      preferences: finalTouch || '',
    };

    const io = req.app.get('io');

    processTailoredApplication(
      _id,
      newApplication._id, // Pass the new document ID
      applicationData,
      io,
    ).catch((err) => console.error('Background Job Failed to Start:', err));

    return res.status(202).json({
      success: true,
      message: 'Tailored application generation has started.',
      applicationId: newApplication._id.toString(),
    });
  } catch (error) {
    console.error('Error initiating tailored application:', error);
    return res.status(500).json({
      error: 'Failed to start tailored application generation',
      details: error.message,
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

export const calculateJobMatchScore = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription)
      return res.status(400).json({ error: 'Job description required' });

    const user = await resolveUser(req.user._id);

    const student = await Student.findById(req.user._id).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await calculateJobMatch(jobDescription, student);

    if (result) {
      try {
        await User.updateOne(
          { _id: student._id },
          { $inc: { 'usageCounters.jobMatching': 1 } },
        );
      } catch (incErr) {
        console.error(
          `Failed to increment usage for user ${student._id}:`,
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

    const student = await Student.findById(req.user._id).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await computeATS(jobDescription, student);

    return res.json(result);
  } catch (err) {
    console.error('ATS Error:', err);
    return res.status(500).json({ error: 'ATS scoring failed' });
  }
};
