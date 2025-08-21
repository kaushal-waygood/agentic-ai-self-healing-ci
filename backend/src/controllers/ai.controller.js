import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';
import pdfParse from 'pdf-parse';
import { genAI } from '../config/gemini.js';
import { CVDataPrompt } from '../prompt/studentCVData.js';
import { v4 as uuidv4 } from 'uuid';
import { convertToHTMLPrompt } from '../prompt/convertToHTML.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { generateCoverLetterPrompt } from '../prompt/generateCoverletter.js';
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

export const generateCVByJD = async (req, res) => {
  const { _id } = req.user;
  const { jobDescription, useProfile, finalTouch } = req.body;

  try {
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    let studentData;

    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student;
    } else {
      if (!req.file) {
        return res.status(400).json({ error: 'CV PDF file is required' });
      }

      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      const dataBuffer = fs.readFileSync(filePath);
      const parsedPDF = await pdfParse(dataBuffer);
      studentData = parsedPDF.text;
      fs.unlinkSync(filePath);
    }

    let prompt;
    prompt = generateCVPrompt(jobDescription, studentData, finalTouch);

    let rawText;
    rawText = await genAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return res.status(500).json({ error: 'Failed to parse JSON response' });
    }

    prompt = convertToHTMLPrompt(parsedJson);
    rawText = await genAI(prompt);
    const htmlContent = rawText.replace(/```html|```/g, '');

    res.setHeader('Content-Type', 'text/html');

    return res.send(rawText);
  } catch (error) {
    console.error('Error generating CV:', error);
    return res.status(500).json({ error: 'Failed to generate CV' });
  }
};

export const generateCVByJobId = async (req, res) => {
  const { _id } = req.user;
  const { jobId, useProfile, finalTouch } = req.body;

  try {
    // Step 1: Validate input
    if (!jobId) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobDescription = job.description;

    let studentData;

    // Step 2: Determine data source
    if (useProfile === 'true' || useProfile === true) {
      // From DB
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student;
    } else {
      // From uploaded PDF
      if (!req.file) {
        return res.status(400).json({ error: 'CV PDF file is required' });
      }

      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      const dataBuffer = fs.readFileSync(filePath);
      const parsedPDF = await pdfParse(dataBuffer);
      studentData = parsedPDF.text;
      fs.unlinkSync(filePath); // Delete file after processing
    }

    // Step 3: Create prompt
    let prompt = generateCVPrompt(jobDescription, studentData, finalTouch);

    // Step 4: Generate with AI
    let rawText = await genAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return res.status(500).json({ error: 'Failed to parse JSON response' });
    }

    prompt = convertToHTMLPrompt(parsedJson);
    rawText = await genAI(prompt);
    const htmlContent = rawText.replace(/```html|```/g, '');

    res.setHeader('Content-Type', 'text/html');

    return res.send(htmlContent);
  } catch (error) {
    console.error('Error generating CV:', error);
    return res.status(500).json({ error: 'Failed to generate CV' });
  }
};

export const generateCVByTitle = async (req, res) => {
  const { _id } = req.user;
  const { title, useProfile, finalTouch } = req.body;

  try {
    // Step 1: Validate input
    if (!title) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    let studentData;

    // Step 2: Determine data source
    if (useProfile === 'true' || useProfile === true) {
      // From DB
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student;
    } else {
      // From uploaded PDF
      if (!req.file) {
        return res.status(400).json({ error: 'CV PDF file is required' });
      }

      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      const dataBuffer = fs.readFileSync(filePath);
      const parsedPDF = await pdfParse(dataBuffer);
      studentData = parsedPDF.text;
      fs.unlinkSync(filePath); // Delete file after processing
    }

    // Step 3: Create prompt
    let prompt = generateCVPrompt(title, studentData, finalTouch);

    // Step 4: Generate with AI
    let rawText = await genAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return res.status(500).json({ error: 'Failed to parse JSON response' });
    }

    prompt = convertToHTMLPrompt(parsedJson);
    rawText = await genAI(prompt);
    const htmlContent = rawText.replace(/```html|```/g, '');

    res.setHeader('Content-Type', 'text/html');

    return res.send(htmlContent);
  } catch (error) {
    console.error('Error generating CV:', error);
    return res.status(500).json({ error: 'Failed to generate CV' });
  }
};

export const generateCoverLetterByJD = async (req, res) => {
  const { _id } = req.user;
  const { jobDescription, useProfile, finalTouch } = req.body;

  try {
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    let studentData;

    // Get resume data
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student; // You can structure this better if needed
    } else {
      if (!req.file) {
        return res.status(400).json({ error: 'CV PDF file is required' });
      }

      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      const dataBuffer = fs.readFileSync(filePath);
      const parsedPDF = await pdfParse(dataBuffer);
      studentData = parsedPDF.text;
      fs.unlinkSync(filePath);
    }

    // Prompt generation
    let prompt = generateCoverLetterPrompt(
      jobDescription,
      studentData,
      finalTouch,
    );

    // Generate cover letter
    let coverLetter = await genAI(prompt);

    prompt = `${coverLetter} 

    Please format the cover letter in HTML format.`;

    coverLetter = await genAI(prompt);

    res.setHeader('Content-Type', 'text/html');

    return res.send(coverLetter.replace(/```html|```/g, '').trim());
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};

export const generateCoverLetterByJobId = async (req, res) => {
  const { _id } = req.user;
  const { jobId, useProfile, finalTouch } = req.body;

  try {
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Fetch job description
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobDescription = job.description;

    let studentData;

    // Get resume data
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student;
    } else {
      if (!req.file) {
        return res.status(400).json({ error: 'CV PDF file is required' });
      }

      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      const dataBuffer = fs.readFileSync(filePath);
      const parsedPDF = await pdfParse(dataBuffer);
      studentData = parsedPDF.text;
      fs.unlinkSync(filePath);
    }

    // Prompt generation
    let prompt = generateCoverLetterPrompt(
      jobDescription,
      studentData,
      finalTouch,
    );

    // Generate cover letter
    let coverLetter = await genAI(prompt);

    console.log(coverLetter);

    prompt = `${coverLetter} 

    Please format the cover letter in HTML format.`;

    coverLetter = await genAI(prompt);
    res.setHeader('Content-Type', 'text/html');
    return res.send(coverLetter.replace(/```html|```/g, '').trim());
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};

export const generateCoverLetterByTitle = async (req, res) => {
  const { _id } = req.user;
  const { title, useProfile, finalTouch } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    let studentData;

    // Get resume data
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student; // You can structure this better if needed
    } else {
      if (!req.file) {
        return res.status(400).json({ error: 'CV PDF file is required' });
      }

      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      const dataBuffer = fs.readFileSync(filePath);
      const parsedPDF = await pdfParse(dataBuffer);
      studentData = parsedPDF.text;
      fs.unlinkSync(filePath);
    }

    // Prompt generation
    const prompt = generateCoverLetterPrompt(title, studentData, finalTouch);

    // Generate cover letter
    const coverLetter = await genAI(prompt);

    // Return plain text (not parsed as JSON)

    const prompt2 = `${coverLetter} 

    Please format the cover letter in HTML format.`;

    const coverLetter2 = await genAI(prompt2);
    res.setHeader('Content-Type', 'text/html');
    return res.send(coverLetter2.replace(/```html|```/g, '').trim());
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
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
    // console.log(student.coverLetter);
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

export const createTailoredApply = async (req, res) => {
  const { _id } = req.user;
  const {
    jobId,
    useProfile,
    savedCVId,
    savedCoverLetterId,
    coverLetterText,
    finalTouch,
  } = req.body;

  try {
    // Step 1: Validate required inputs
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Step 2: Fetch job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    let studentData;
    let cvContent;
    let coverLetterContent;

    // Step 3: Determine CV source
    if (useProfile) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = student;
    } else if (savedCVId) {
      const savedCV = await SavedCV.findOne({ _id: savedCVId, user: _id });
      if (!savedCV) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }
      cvContent = savedCV.content;
    } else if (req.file) {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      try {
        const dataBuffer = fs.readFileSync(filePath);
        const parsedPDF = await pdfParse(dataBuffer);
        cvContent = parsedPDF.text;
      } finally {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      return res.status(400).json({
        error: 'Either useProfile, savedCVId, or CV file must be provided',
      });
    }

    // Step 4: Determine cover letter source
    if (savedCoverLetterId) {
      const savedCL = await Student.findOne({
        _id,
      }).coverLetter.find((cl) => cl._id.toString() === savedCoverLetterId);
      if (!savedCL) {
        return res.status(404).json({ error: 'Saved cover letter not found' });
      }
      coverLetterContent = savedCL.content;
    } else if (coverLetterText) {
      coverLetterContent = coverLetterText;
    }

    // Step 5: Prepare data for AI
    const applicationData = {
      job: {
        title: job.title,
        company: job.company,
        description: job.description,
      },
      candidate: studentData || {
        cv: cvContent,
      },
      coverLetter: coverLetterContent,
      preferences: finalTouch,
    };

    // Step 6: Generate each component with separate prompts
    const [cvResponse, coverLetterResponse, emailResponse] = await Promise.all([
      genAI(generateCVPrompts(applicationData)),
      genAI(generateCoverLetterPrompt(applicationData)),
      genAI(generateEmailPrompt(applicationData)),
    ]);

    // Step 7: Process AI responses
    let tailoredCV, tailoredCoverLetter, applicationEmail;

    try {
      tailoredCV = processCVResponse(cvResponse);
      tailoredCoverLetter = processCoverLetterResponse(coverLetterResponse);
      applicationEmail = processEmailResponse(emailResponse);
    } catch (err) {
      console.error('Error processing AI responses:', err);
      return res.status(500).json({ error: 'Failed to process AI responses' });
    }

    // Step 8: Return results
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
