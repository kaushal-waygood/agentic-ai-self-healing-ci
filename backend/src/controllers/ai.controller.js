import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';
import pdfParse from 'pdf-parse';
import { genAI } from '../config/gemini.js';
import { convertToHTMLPrompt } from '../prompt/convertToHTML.js';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import { extractDataFromCV } from '../utils/extractedCv.js';
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

export const getAllCVs = async (req, res) => {
  try {
    const { _id } = req.user;
    // 1. Remove .sort() from the query. It's not effective on findById.
    const user = await Student.findById(_id).select('cvs');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Safely handle the case where user.cvs might be undefined.
    //    If it is, default to an empty array before sorting.
    const cvsToSort = user.cvs || [];

    // 3. Sort the resulting array. This works even if the array is empty.
    const sortedCVs = cvsToSort.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({ cvs: sortedCVs });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ error: 'Failed to retrieve CVs' });
  }
};

export const getAllCLs = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await Student.findById(_id).select('cls');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const clsToSort = user.cls || [];
    const sortedCLs = clsToSort.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({ cls: sortedCLs });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ error: 'Failed to retrieve CVs' });
  }
};

export const getAllTailoredApplications = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await Student.findById(_id).select('tailoredApplications');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tailoredApplicationsToSort = user.tailoredApplications || [];
    const sortedTailoredApplications = tailoredApplicationsToSort.sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    res.status(200).json({ tailoredApplications: sortedTailoredApplications });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ error: 'Failed to retrieve CVs' });
  }
};

export const getSingleCV = async (req, res) => {
  try {
    const { cvId } = req.params;
    const { _id: userId } = req.user;

    const student = await Student.findOne(
      {
        _id: userId,
        'cvs._id': cvId,
      },
      {
        'cvs.$': 1,
      },
    );

    if (!student || !student.cvs || student.cvs.length === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const cv = student.cvs[0]; // Get the first (and only) matched CV

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

    const student = await Student.findOne(
      {
        _id: userId,
        'cls._id': clId,
      },
      {
        'cls.$': 1,
      },
    );

    if (!student || !student.cls || student.cls.length === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const cl = student.cls[0]; // Get the first (and only) matched CV

    res.status(200).json({
      success: true,
      cl,
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

    const student = await Student.findOne(
      {
        _id: userId,
        'tailoredApplications._id': applicationId,
      },
      {
        'tailoredApplications.$': 1,
      },
    );

    if (
      !student ||
      !student.tailoredApplications ||
      student.tailoredApplications.length === 0
    ) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const application = student.tailoredApplications[0]; // Get the first (and only) matched CV

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching CV:', error);
    res.status(500).json({ error: 'Failed to retrieve CV' });
  }
};

// If you need to also delete associated files
export const deleteSingleCV = async (req, res) => {
  try {
    const { cvId } = req.params;
    const { _id: userId } = req.user;

    // First find the CV to get file paths
    const student = await Student.findOne({ _id: userId, 'cvs._id': cvId });

    if (!student) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const cvToDelete = student.cvs.id(cvId);

    // Delete associated file from storage if exists
    if (cvToDelete.filePath) {
      await deleteFileFromStorage(cvToDelete.filePath);
    }

    // Remove from database
    await Student.updateOne({ _id: userId }, { $pull: { cvs: { _id: cvId } } });

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
    const student = await Student.findOne({ _id: userId, 'cls._id': clId });

    if (!student) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const clToDelete = student.cls.id(clId);

    // Delete associated file from storage if exists
    if (clToDelete.filePath) {
      await deleteFileFromStorage(clToDelete.filePath);
    }

    // Remove from database
    await Student.updateOne({ _id: userId }, { $pull: { cls: { _id: clId } } });

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
    const student = await Student.findOne({
      _id: userId,
      'tailoredApplications._id': appId,
    });

    if (!student) {
      return res.status(404).json({ error: 'Tailored application not found' });
    }

    const tailoredApplicationToDelete = student.tailoredApplications.id(appId);

    if (!tailoredApplicationToDelete) {
      return res.status(404).json({ error: 'Tailored application not found' });
    }

    // Delete associated file from storage if exists
    if (tailoredApplicationToDelete.filePath) {
      await deleteFileFromStorage(tailoredApplicationToDelete.filePath);
    }

    // Remove from database - FIXED: pulling from tailoredApplications, not cls
    await Student.updateOne(
      { _id: userId },
      { $pull: { tailoredApplications: { _id: appId } } },
    );

    res.status(200).json({
      success: true,
      message: 'Tailored application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tailored application:', error);
    res.status(500).json({ error: 'Failed to delete tailored application' });
  }
};

// CV
export const generateCVByTitle = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Job title is required' });
  }
  await initiateCVGeneration(req, res, title);
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
  await initiateCVGeneration(req, res, job.description);
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

export const saveStudentHTMLCV = async (req, res) => {
  const { _id } = req.user;
  const { html, title, ats } = req.body;

  try {
    // Handle html as either string or object
    const htmlString = typeof html === 'object' && html.cv ? html.cv : html;

    if (!htmlString || typeof htmlString !== 'string') {
      console.log('Invalid HTML content:', html);
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
            html: htmlString,
            htmlCVTitle: title,
            ats,
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

    // Step 1: Determine Job Source and Validate
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

    // Step 2: Determine CV source
    if (useProfile === 'true' || useProfile === true) {
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

    // Step 3: Create application entry in database
    const applicationId = new mongoose.Types.ObjectId();
    const newApplication = {
      _id: applicationId,
      jobId: jobId ? new mongoose.Types.ObjectId(jobId) : null,
      jobTitle: jobDetails.title,
      companyName: jobDetails.company,
      jobDescription: jobDetails.description,
      useProfile: useProfile === 'true' || useProfile === true,
      savedCVId,
      savedCoverLetterId,
      coverLetterText,
      finalTouch,
      status: 'pending',
      createdAt: new Date(),
    };

    await Student.findByIdAndUpdate(_id, {
      $push: {
        tailoredApplications: { $each: [newApplication], $position: 0 },
      },
    });

    // Step 4: Prepare data for background processing
    const applicationData = {
      job: {
        title: jobDetails.title,
        company: jobDetails.company,
        description: jobDetails.description,
      },
      candidate: studentData
        ? JSON.stringify(studentData)
        : JSON.stringify({ cv: cvContent }),
      coverLetter: coverLetterText,
      preferences: finalTouch,
    };

    // Step 5: Trigger background processing
    const io = req.app.get('io');
    processTailoredApplication(_id, applicationId, applicationData, io);

    // Step 6: Immediately respond to the user
    return res.status(202).json({
      success: true,
      message:
        'Tailored application generation has started. You will be notified when it is complete.',
      applicationId: applicationId.toString(),
    });
  } catch (error) {
    console.error('Error initiating tailored application:', error);
    res.status(500).json({
      error: 'Failed to start tailored application generation',
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
