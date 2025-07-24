import slugify from 'slugify';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import { User } from '../models/user.model.js';
import { cloudinary } from '../config/cloudinary.js';
import fs, { unlinkSync } from 'fs';
import path from 'path';
import { safeUnlink, __dirname } from '../utils/fileUploadingManaging.js';
import pdfParse from 'pdf-parse';
import { genAI } from '../config/gemini.js';
import { CVDataPrompt } from '../prompt/studentCVData.js';
import { v4 as uuidv4 } from 'uuid';
import { convert } from 'pdf-poppler';
import { convertToHTMLPrompt } from '../prompt/convertToHTML.js';
import puppeteer from 'puppeteer';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { generateCoverLetterPrompt } from '../prompt/generateCoverletter.js';

export const studentDetails = async (req, res) => {
  const { _id } = req.user;

  try {
    // Get the user
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res
        .status(403)
        .json({ message: 'Only students can create student profile' });
    }

    const existingStudent = await Student.findOne({ email: user.email });
    if (existingStudent) {
      return res.status(200).json({ studentDetails: existingStudent });
    }

    // Create new student profile
    const studentDetails = await Student.create({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      jobRole: user.jobRole,
    });

    return res.status(201).json({ studentDetails });
  } catch (error) {
    console.error('Error creating student details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addStudentSkills = async (req, res) => {
  const { skill, level } = req.body;
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const skillId = slugify(`${skill}-${level}`, { lower: true });
    const existingSkill = student.skills.find((s) => s.skillId === skillId);
    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    student.skills.push({ skill, level, skillId });
    await student.save();
    res
      .status(200)
      .json({ message: 'Skills added successfully', student: student.skills });
  } catch (error) {
    console.error('Error adding skills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeStudentSkills = async (req, res) => {
  const { skillId } = req.params;
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    student.skills = student.skills.filter((s) => s.skillId !== skillId);
    await student.save();
    res.status(200).json({ message: 'Skills removed successfully' });
  } catch (error) {
    console.error('Error removing skills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addExperience = async (req, res) => {
  const { company, title, startDate, endDate, description, currentlyWorking } =
    req.body;
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const experienceId = slugify(`${company}-${title}`, { lower: true });

    if (student.experience.find((exp) => exp.experienceId === experienceId)) {
      return res.status(400).json({ message: 'Experience already exists' });
    }

    student.experience.push({
      experienceId,
      company,
      title,
      startDate,
      endDate,
      description,
      currentlyWorking,
    });

    await student.save();
    res.status(200).json({
      message: 'Experience added successfully',
      experience: student.experience,
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeExperience = async (req, res) => {
  const { expId: experienceId } = req.params;
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.experience = student.experience.filter(
      (exp) => exp.experienceId !== experienceId,
    );

    await student.save();
    res.status(200).json({ message: 'Experience removed successfully' });
  } catch (error) {
    console.error('Error removing experience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addEducations = async (req, res) => {
  const {
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    grade,
    institute,
    isCurrentlyStudying,
  } = req.body;
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const educationId = slugify(`${degree}-${fieldOfStudy}`, { lower: true });

    if (student.education.find((edu) => edu.educationId === educationId)) {
      return res.status(400).json({ message: 'Education already exists' });
    }

    student.education.push({
      educationId,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      institute,
      isCurrentlyStudying,
    });

    await student.save();
    res.status(200).json({
      message: 'Education added successfully',
      education: student.education,
    });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeEducation = async (req, res) => {
  const { eduId: educationId } = req.params;
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.education = student.education.filter(
      (edu) => edu.educationId !== educationId,
    );

    await student.save();
    res.status(200).json({ message: 'Education removed successfully' });
  } catch (error) {
    console.error('Error removing education:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addProfileImage = async (req, res) => {
  const { _id } = req.user;

  // If no file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  const localFilePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'profileImage',
    req.file.filename,
  );

  try {
    // Find student
    const student = await Student.findById(_id);
    if (!student) {
      fs.unlinkSync(localFilePath); // Cleanup if user not found
      return res.status(404).json({ message: 'Student not found' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'student-profile-images',
    });

    // Save Cloudinary URL to DB
    student.profileImage = result.secure_url;
    await student.save();

    // Delete from local storage
    safeUnlink(localFilePath);

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImage: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    safeUnlink(localFilePath);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfileImage = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  const localFilePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'profileImage',
    req.file.filename,
  );

  try {
    const student = await Student.findById(_id);
    if (!student) {
      safeUnlink(localFilePath);
      return res.status(404).json({ message: 'Student not found' });
    }

    // 1. Delete previous image from Cloudinary
    if (student.profileImagePublicId) {
      await cloudinary.uploader.destroy(student.profileImagePublicId);
    }

    // 2. Upload new image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: 'student-profile-images',
    });

    // 3. Save new image URL & public_id
    student.profileImage = uploadResult.secure_url;
    student.profileImagePublicId = uploadResult.public_id;
    await student.save();

    // 4. Delete from local
    safeUnlink(localFilePath);

    return res.status(200).json({
      message: 'Profile image updated successfully',
      profileImage: student.profileImage,
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    safeUnlink(localFilePath);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addResume = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded' });
  }

  const localFilePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'pdf',
    req.file.filename,
  );

  try {
    const student = await Student.findById(_id);
    if (!student) {
      safeUnlink(localFilePath);
      return res.status(404).json({ message: 'Student not found' });
    }

    // 1. Delete previous resume from Cloudinary
    if (student.resumePublicId) {
      await cloudinary.uploader.destroy(student.resumePublicId);
    }

    // 2. Upload new resume to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: 'student-resumes',
    });

    // 3. Save new resume URL & public_id
    student.resumeUrl = uploadResult.secure_url;
    student.resumePublicId = uploadResult.public_id;
    await student.save();

    // 4. Delete from local
    safeUnlink(localFilePath);

    return res.status(200).json({
      message: 'Resume uploaded successfully',
      resumeUrl: student.resumeUrl,
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    safeUnlink(localFilePath);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const appliedJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (student.appliedJobs.includes(jobId)) {
      return res
        .status(400)
        .json({ message: 'You have already applied for this job' });
    }

    student.appliedJobs.push(jobId);

    job.appliedStudents.push(student._id);
    await student.save();

    return res.status(200).json({ message: 'Job applied successfully' });
  } catch (error) {
    console.error('Error applying for job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addProjects = async (req, res) => {
  const {
    projectName,
    description,
    startDate,
    endDate,
    technologies,
    link,
    isWorkingActive,
  } = req.body;

  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.projects.push({
      projectName,
      description,
      startDate,
      endDate,
      technologies,
      link,
      isWorkingActive,
    });
    await student.save();

    return res.status(200).json({ message: 'Project added successfully' });
  } catch (error) {
    console.error('Error adding project:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.projects = student.projects.filter(
      (project) => project._id.toString() !== projectId,
    );
    await student.save();

    return res.status(200).json({ message: 'Project removed successfully' });
  } catch (error) {
    console.error('Error removing project:', error);
    return res.status(500).json({ message: 'Internal server error' });
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
        // resumeUrl: `/pdf/${req.file.filename}`,
      },
      { new: true, runValidators: true },
    );

    return res.json({
      success: true,
      data: updatedStudent,
      parsedJson,
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
    // Step 1: Validate input
    if (!jobDescription) {
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
      studentData = student; // You can pick and structure fields here if needed
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
      console.log(studentData);
      fs.unlinkSync(filePath); // Delete file after processing
    }

    // Step 3: Create prompt
    const prompt = generateCVPrompt(jobDescription, studentData, finalTouch);

    // Step 4: Generate with AI
    const rawText = await genAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return res.status(500).json({ error: 'Failed to parse JSON response' });
    }

    return res.json({ success: true, data: parsedJson });
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
    const prompt = generateCVPrompt(jobDescription, studentData, finalTouch);

    // Step 4: Generate with AI
    const rawText = await genAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return res.status(500).json({ error: 'Failed to parse JSON response' });
    }

    return res.json({ success: true, data: parsedJson });
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
    const prompt = generateCVPrompt(title, studentData, finalTouch);

    // Step 4: Generate with AI
    const rawText = await genAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return res.status(500).json({ error: 'Failed to parse JSON response' });
    }

    return res.json({ success: true, data: parsedJson });
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
    const prompt = generateCoverLetterPrompt(
      jobDescription,
      studentData,
      finalTouch,
    );

    // Generate cover letter
    const coverLetter = await genAI(prompt);

    // Return plain text (not parsed as JSON)
    return res.json({ success: true, coverLetter: coverLetter.trim() });
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
      return res.status(400).json({ error: 'Job description is required' });
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
    const prompt = generateCoverLetterPrompt(
      jobDescription,
      studentData,
      finalTouch,
    );

    // Generate cover letter
    const coverLetter = await genAI(prompt);

    // Return plain text (not parsed as JSON)
    return res.json({ success: true, coverLetter: coverLetter.trim() });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};

export const generateCoverLetterByTitle = async (req, res) => {
  const { _id } = req.user;
  const { title, useProfile, finalTouch } = req.body;
  console.log(req.body);

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
    return res.json({ success: true, coverLetter: coverLetter.trim() });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};
