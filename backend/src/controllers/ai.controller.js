import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';
import pdfParse from 'pdf-parse';
import { genAI } from '../config/gemini.js';
import { convertToHTMLPrompt } from '../prompt/convertToHTML.js';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import {
  generateCVPrompts,
  generateCoverLetterPrompts,
  generateEmailPrompt,
  processCVResponse,
  processCoverLetterResponse,
  processEmailResponse,
} from '../utils/generateTailored.js';
import { extractDataFromCV } from '../utils/extractedCv.js';
import { generateCVCore } from '../utils/generateCVCore.js';
import { generateCoverLetterCore } from '../utils/generateCoverLetterCore.js';
import { genAIWithRetry } from '../utils/genAIWithRetry.js';
import { calculateJobMatch } from '../utils/calculateJobMatch.js';
import { generateCVRegeneratePrompt } from '../prompt/generateCVPrompt.js';

export const extractStudentDataFromCV = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const filePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'pdf',
    req.file.filename,
  );

  try {
    // Extract data using shared utility
    const extractedData = await extractDataFromCV(filePath);

    // Clean up file
    fs.unlinkSync(filePath);

    // Update student record
    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      {
        fullName: extractedData.personalInfo.fullName,
        phone: extractedData.personalInfo.phone,
        skills: extractedData.skills,
        education: extractedData.education,
        experience: extractedData.experience,
        projects: extractedData.projects,
        jobPreferences: extractedData.jobPreferences,
      },
      { new: true, runValidators: true },
    );

    return res.json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error('Error updating student from CV:', error);
    res.status(500).json({
      error: 'Failed to extract or update student data from CV',
      message: error.message,
    });
  }
};

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

// CV
export const generateCVByTitle = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Job title is required' });
  }
  await generateCVCore(req, res, title);
};

export const generateCVByJD = async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }
  await generateCVCore(req, res, jobDescription);
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
  await generateCVCore(req, res, job.description);
};

export const regenerateCV = async (req, res) => {
  try {
    const { _id } = req.user;
    const studentData = await Student.findById(_id);
    // The request body contains all necessary context for regeneration.
    const { jobContextString, finalTouch, previousCVJson } = req.body;

    // --- Input Validation ---
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
    const rawJsonResponse = await genAI(prompt);
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

// Cover letter
export const generateCoverLetterByTitle = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Job title is required' });
  }
  await generateCoverLetterCore(req, res, title);
};

export const generateCoverLetterByJD = async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }
  await generateCoverLetterCore(req, res, jobDescription);
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
  await generateCoverLetterCore(req, res, job.description);
};

export const saveStudentHTMLCV = async (req, res) => {
  const { _id } = req.user;
  const { html, title } = req.body;

  try {
    // Validate input
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'Invalid HTML content' });
    }

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid title' });
    }

    const student = await Student.findByIdAndUpdate(
      _id,
      {
        $push: {
          htmlCV: {
            html: html,
            htmlCVTitle: title,
            updatedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json({
      success: true,
      message: 'HTML CV saved successfully',
      data: {
        cvCount: student.htmlCV.length,
        latestCV: student.htmlCV[student.htmlCV.length - 1],
      },
    });
  } catch (error) {
    console.error('Error saving HTML CV:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Failed to save HTML CV',
      message: error.message,
    });
  }
};

export const getStudentHTMLCV = async (req, res) => {
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ success: true, html: student.htmlCV });
  } catch (error) {
    console.error('Error getting HTML CV:', error);
    return res.status(500).json({ error: 'Failed to get HTML CV' });
  }
};

export const getSingleStudentHTMLCV = async (req, res) => {
  const { _id } = req.user;
  const { cvId } = req.params;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const cv = student.htmlCV.find((cv) => cv._id.toString() === cvId);
    if (!cv) {
      return res.status(404).json({ error: 'HTML CV not found' });
    }
    return res.json({ success: true, html: cv });
  } catch (error) {
    console.error('Error getting HTML CV:', error);
    return res.status(500).json({ error: 'Failed to get HTML CV' });
  }
};

export const savedStudentHTMLLetter = async (req, res) => {
  const { _id } = req.user;
  const { html, title } = req.body;

  try {
    // Validate input
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'Invalid HTML content' });
    }

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid title' });
    }

    const student = await Student.findByIdAndUpdate(
      _id,
      {
        $push: {
          coverLetter: {
            coverLetter: html,
            coverLetterTitle: title,
            updatedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Defensive fallback if htmlLetter is undefined or null
    const htmlLetters = Array.isArray(student.htmlLetter)
      ? student.htmlLetter
      : [];

    return res.json({
      success: true,
      message: 'HTML Letter saved successfully',
    });
  } catch (error) {
    console.error('Error saving HTML Letter:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Failed to save HTML Letter',
      message: error.message,
    });
  }
};

export const getStudentHTMLLetter = async (req, res) => {
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ success: true, html: student.coverLetter });
  } catch (error) {
    console.error('Error getting HTML Letter:', error);
    return res.status(500).json({ error: 'Failed to get HTML Letter' });
  }
};

export const getSingleStudentHTMLLetter = async (req, res) => {
  const { _id } = req.user;
  const { letterId } = req.params;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const letter = student.htmlLetter.find(
      (letter) => letter._id.toString() === letterId,
    );
    if (!letter) {
      return res.status(404).json({ error: 'HTML Letter not found' });
    }
    return res.json({ success: true, html: letter });
  } catch (error) {
    console.error('Error getting HTML Letter:', error);
    return res.status(500).json({ error: 'Failed to get HTML Letter' });
  }
};

import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);

// Helper function to extract text from a buffer based on MIME type
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

export const createTailoredApply = async (req, res) => {
  const { _id } = req.user;
  const {
    // Job details can come as an ID or as raw text
    jobId,
    jobTitle,
    companyName,
    jobDescription,
    // CV/CL sources
    useProfile,
    savedCVId,
    savedCoverLetterId,
    coverLetterText,
    finalTouch,
  } = req.body;

  try {
    let jobDetails;

    // --- MODIFICATION START ---
    // Step 1: Determine Job Source and Validate
    // The frontend can send either a jobId (for selected jobs) or the full text
    // (for pasted or uploaded job descriptions).
    if (jobId) {
      const jobFromDb = await Job.findById(jobId);
      if (!jobFromDb) {
        return res.status(404).json({ error: 'Job not found in database' });
      }
      jobDetails = jobFromDb;
    } else if (jobTitle && companyName && jobDescription) {
      // Job details were sent as text (from a paste or client-side file parse)
      jobDetails = {
        title: jobTitle,
        company: companyName,
        description: jobDescription,
      };
    } else {
      // If neither is provided, then it's a bad request.
      return res.status(400).json({
        error:
          'Job information is required. Provide either a jobId or the jobTitle, companyName, and jobDescription.',
      });
    }
    // --- MODIFICATION END ---

    let studentData;
    let cvContent;
    let coverLetterContent;

    // Step 2: Determine CV source
    if (useProfile === 'true') {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student; // This will be JSON stringified later
    } else if (req.file) {
      // Assumes multer is configured for memoryStorage
      cvContent = await extractTextFromBuffer(req.file);
    } else {
      return res.status(400).json({
        error: 'A CV source is required (profile, saved CV, or file upload).',
      });
    }

    // Step 3: Determine cover letter source
    if (savedCoverLetterId) {
      const studentWithCL = await Student.findById(_id).select('coverLetter');
      const savedCL = studentWithCL?.coverLetter.id(savedCoverLetterId);
      if (!savedCL) {
        return res.status(404).json({ error: 'Saved cover letter not found' });
      }
      coverLetterContent = savedCL.content;
    } else if (coverLetterText) {
      coverLetterContent = coverLetterText;
    }

    // Step 4: Prepare data for AI
    const applicationData = {
      job: {
        title: jobDetails.title,
        company: jobDetails.company,
        description: jobDetails.description,
      },
      // Ensure candidate data is structured correctly for the prompts
      candidate: studentData
        ? JSON.stringify(studentData)
        : JSON.stringify({ cv: cvContent }),
      coverLetter: coverLetterContent,
      preferences: finalTouch,
    };

    // Step 5: Generate each component with separate prompts
    const [cvResponse, coverLetterResponse, emailResponse] = await Promise.all([
      genAIWithRetry(generateCVPrompts(applicationData)),
      genAIWithRetry(generateCoverLetterPrompts(applicationData)),
      genAIWithRetry(generateEmailPrompt(applicationData)),
    ]);

    // Step 6: Process AI responses
    const tailoredCV = processCVResponse(cvResponse);
    const tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);
    const applicationEmail = processEmailResponse(emailResponse);

    // Step 7: Return results
    res.json({
      success: true,
      data: {
        tailoredCV,
        tailoredCoverLetter,
        applicationEmail,
      },
    });
  } catch (error) {
    console.error('Error in createTailoredApply:', error);
    res.status(500).json({
      error: 'Failed to create tailored application',
      details: error.message,
    });
  }
};

export const calculateJobMatchScore = async (req, res) => {
  const { jobDescription } = req.body;
  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { matchScore, recommendation } = await calculateJobMatch(
      jobDescription,
      student,
    );
    res.json({ matchScore, recommendation });
  } catch (error) {
    console.error('Error in calculateJobMatchScore:', error);
    res.status(500).json({ error: 'Failed to calculate job match score' });
  }
};
