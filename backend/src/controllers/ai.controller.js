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
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    fs.unlinkSync(filePath); // delete uploaded file

    const prompt = CVDataPrompt(pdfData.text);
    const rawText = await genAI(prompt);

    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON received from AI',
        raw: rawText,
      });
    }

    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const education = (parsedJson.education || []).map((item) => ({
      educationId: uuidv4(),
      institute: item.institute || '',
      degree: item.degree || '',
      fieldOfStudy: item.fieldOfStudy || '',
      startYear: item.startYear || null,
      endYear: item.endYear || null,
      grade: item.grade || '',
    }));

    const experience = (parsedJson.experience || []).map((item) => ({
      experienceId: uuidv4(),
      company: item.company || '',
      title: item.title || '',
      employmentType: 'FULL_TIME', // or parse if available
      location: item.location || '',
      startDate: item.startDate ? new Date(item.startDate) : null,
      endDate: item.endDate ? new Date(item.endDate) : null,
      description: item.description || '',
      experienceYrs: item.experienceYrs || 0,
      currentlyWorking: item.currentlyWorking || false,
      technologies: item.technologies || [],
    }));

    const skills = (parsedJson.skills || []).map((item) => {
      const skill = typeof item === 'string' ? item : item.skill;
      const level =
        typeof item === 'object' && item.level
          ? item.level.toUpperCase()
          : 'BEGINNER';

      return {
        skillId: uuidv4(),
        skill: skill || '',
        level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)
          ? level
          : 'BEGINNER',
      };
    });

    const projects = (parsedJson.projects || []).map((item) => ({
      projectName: item.projectName || '',
      description: item.description || '',
      startDate: item.startDate ? new Date(item.startDate) : null,
      endDate: item.endDate ? new Date(item.endDate) : null,
      technologies: item.technologies || [],
      link: item.link || '',
      isWorkingActive: item.isWorkingActive || false,
    }));

    // === Perform the Update ===
    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      {
        fullName: parsedJson.fullName || student.fullName,
        phone: parsedJson.phone || student.phone,
        skills,
        education,
        experience,
        projects,
        jobPreferences: parsedJson.jobPreferences || student.jobPreferences,
        // resumeUrl: `/pdf/${req.file.filename}`,
      },
      { new: true, runValidators: true },
    );

    return res.json({
      success: true,
      data: updatedStudent,
    });
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

// Separate prompt generators
const generateCVPrompts = (data) => {
  return `
  You are a professional CV writer. Based on the following data, generate a polished, well-formatted **Harvard-style CV** in pure HTML (no markdown or styling frameworks). Follow these instructions closely:

  === JOB DETAILS ===
  Job Title: ${data.job.title}
  Company: ${data.job.company}
  Job Description: ${data.job.description}

  === CANDIDATE DETAILS ===
  ${JSON.stringify(data.candidate, null, 2)}

  === ADDITIONAL PREFERENCES ===
  ${data.preferences || 'None provided'}

  === INSTRUCTIONS ===
  - Use the Harvard-style CV format: clean, professional, and minimal.
  - Sections should include:
    1. Contact Information (name, phone, email, LinkedIn, etc.)
    2. Professional Summary (3–4 lines tailored to the job)
    3. Key Skills (bullet points)
    4. Work Experience (most recent first, with bullet points for achievements)
    5. Education (most recent first, include degrees, institutions, and dates)
    6. Certifications or Awards (if any)
    7. Projects or Publications (if any)
    8. Additional Information (languages, interests, etc.)
  - Tailor the CV content to match the job description and highlight the candidate's most relevant skills and experiences.
  - Return only valid, clean HTML wrapped in a single <html><body>...</body></html> block.
  - Do not include any external CSS or scripts—inline styles only if necessary for readability.
  - Use consistent fonts, spacing, and structure appropriate for a Harvard-style professional CV.
  `;
};

const generateCoverLetterPrompts = (data) => {
  return `
You are a professional career writing assistant. Based on the information provided below, generate a **well-formatted HTML cover letter** that is tailored to the job and candidate profile.

=== JOB DETAILS ===
Job Title: ${data.job.title}
Company: ${data.job.company}
Job Description:
${data.job.description}

=== CANDIDATE INFORMATION ===
${JSON.stringify(data.candidate, null, 2)}

=== EXISTING COVER LETTER ===
${
  data.coverLetter
    ? `Use this content as a reference or starting point:\n${data.coverLetter}`
    : 'None provided'
}

=== ADDITIONAL PREFERENCES ===
${data.preferences || 'None provided'}

=== INSTRUCTIONS ===
- Generate the cover letter in **complete, valid HTML**, wrapped in \`<html><body>...</body></html>\` tags.
- **Do not return plain text** or markdown.
- Use **professional inline CSS** for font (e.g., Arial or Georgia), spacing, and readability.
- The tone should be confident, warm, and professional—not overly formal.
- Use a standard business format:
  1. Personalized greeting ("Dear Hiring Manager" or a specific name if provided)
  2. Opening paragraph stating interest in the role
  3. One or two body paragraphs connecting experience and skills to the job description
  4. Closing paragraph with a call to action (e.g., availability for interview)
  5. Proper sign-off with full name

- Do **not** include external assets, stylesheets, or JavaScript—**HTML and inline CSS only**.
- Ensure the letter fits on a standard page and is suitable for email or PDF export.

Return only the formatted HTML content. No explanation or extra comments.
  `;
};

const generateEmailPrompt = (data) => {
  return `
  Compose a professional application email to submit the CV and cover letter for this job:
  
  Position: ${data.job.title}
  Company: ${data.job.company}
  
  Candidate Information:
  ${JSON.stringify(data.candidate, null, 2)}
  
  The email should:
  - Be concise (3-4 paragraphs max)
  - Include a clear subject line
  - Introduce the candidate
  - Briefly mention why they're a good fit
  - Reference the attached documents
  - Include a professional closing
  
  Please return the email in HTML format without any markdown formatting.
  `;
};

// Response processors
const processCVResponse = (response) => {
  // Clean up AI response and ensure proper HTML formatting
  return response.replace(/```html|```/g, '').trim();
};

const processCoverLetterResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};

const processEmailResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};
