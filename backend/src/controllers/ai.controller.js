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
import {
  generateCLRegeneratePrompt,
  generateCVRegeneratePrompt,
} from '../prompt/generateCVPrompt.js';
import { User } from '../models/User.model.js';

const retryOperation = async (operation, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.status === 503 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
};

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
    // Wrap the extraction logic in our retry helper
    const extractedData = await retryOperation(() =>
      extractDataFromCV(filePath),
    );

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
    // Now the catch block handles the final error after all retries have failed
    console.error('Error updating student from CV:', error);

    // Send a more specific error message to the client
    if (error.status === 503) {
      return res.status(503).json({
        error:
          'The AI service is temporarily busy. Please try again in a few moments.',
      });
    }

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

export const regenerateCL = async (req, res) => {
  try {
    const { _id } = req.user;
    const studentData = await Student.findById(_id);
    const {
      jobContextString,
      finalTouch,
      currentContent: previousCLJson,
    } = req.body;

    // if (!jobContextString || !studentData || !previousCLJson) {
    //   return res.status(400).json({
    //     error:
    //       'jobContextString, studentData, and previousCLJson are required for regeneration.',
    //   });
    // }

    const prompt = generateCLRegeneratePrompt(
      jobContextString,
      studentData,
      finalTouch,
      previousCLJson,
    );

    const rawJsonResponse = await genAI(prompt);
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
  const { html, title, ats } = req.body;

  console.log('Received ATS value:', ats);

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
            ats: ats,
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
    jobId,
    jobTitle,
    companyName,
    jobDescription,
    useProfile,
    savedCVId,
    savedCoverLetterId,
    coverLetterText,
    finalTouch,
  } = req.body;

  try {
    let jobDetails;

    // Step 1: Determine Job Source and Validate (No changes needed here)
    if (jobId) {
      const jobFromDb = await Job.findById(jobId);
      if (!jobFromDb) {
        return res.status(404).json({ error: 'Job not found in database' });
      }
      jobDetails = jobFromDb;
    } else if (jobTitle && companyName && jobDescription) {
      jobDetails = {
        title: jobTitle,
        company: companyName,
        description: jobDescription,
      };
    } else {
      return res.status(400).json({
        error:
          'Job information is required. Provide either a jobId or the jobTitle, companyName, and jobDescription.',
      });
    }

    let studentData;
    let cvContent;
    let coverLetterContent;

    // Step 2: Determine CV source (No changes needed here)
    if (useProfile === 'true') {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student;
    } else if (req.file) {
      cvContent = await extractTextFromBuffer(req.file);
    } else {
      return res
        .status(400)
        .json({ error: 'A CV source is required (profile or file upload).' });
    }

    // Step 3: Determine cover letter source (No changes needed here)
    if (savedCoverLetterId) {
      const studentWithCL = await Student.findById(_id).select('coverLetter');
      const savedCL = studentWithCL?.coverLetter.id(savedCoverLetterId);
      coverLetterContent = savedCL?.content;
    } else if (coverLetterText) {
      coverLetterContent = coverLetterText;
    }

    // Step 4: Prepare data for AI (No changes needed here)
    const applicationData = {
      job: {
        title: jobDetails.title,
        company: jobDetails.company,
        description: jobDetails.description,
      },
      candidate: studentData
        ? JSON.stringify(studentData)
        : JSON.stringify({ cv: cvContent }),
      coverLetter: coverLetterContent,
      preferences: finalTouch,
    };

    // ✅ --- FIX: Changed from parallel to sequential requests for reliability ---
    // Instead of firing all requests at once with Promise.all, we now wait for each one
    // to complete. This is much less aggressive on the API and prevents overloads.

    console.log('Step 5.1: Generating tailored CV...');
    const cvResponse = await genAIWithRetry(generateCVPrompts(applicationData));
    const tailoredCV = processCVResponse(cvResponse);

    console.log('Step 5.2: Generating tailored Cover Letter...');
    const coverLetterResponse = await genAIWithRetry(
      generateCoverLetterPrompts(applicationData),
    );
    const tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);

    console.log('Step 5.3: Generating application Email...');
    const emailResponse = await genAIWithRetry(
      generateEmailPrompt(applicationData),
    );
    const applicationEmail = processEmailResponse(emailResponse);

    // Step 6: Return results
    console.log('Step 6: All generations successful. Sending response.');
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

export const saveTailoredApplication = async (req, res) => {
  const studentId = req.user._id;
  // ✅ UPDATED: Destructure the new job detail fields from the request body
  const {
    jobTitle,
    jobCompany,
    jobDescription,
    cvContent,
    coverLetterContent,
    emailContent,
  } = req.body;

  // 1. Validate the incoming data
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
      console.log(
        `Updating existing application for job: ${jobTitle} at ${jobCompany}`,
      );
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
      console.log(
        `Creating new application for job: ${jobTitle} at ${jobCompany}`,
      );
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
