import slugify from 'slugify';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import { User } from '../models/User.model.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { safeUnlink, __dirname } from '../utils/fileUploadingManaging.js';
import calculateExperience from '../utils/calculateExperience.js';
import mongoose from 'mongoose';
import { google } from 'googleapis';
import pkg from 'base64url';
import { generatePdfFromHtml } from '../utils/generatePdfFromHtml.js';
import redisClient from '../config/redis.js';

import {
  calculateMatchScore,
  getFallbackJobsFromRapidAPI,
  convertSalaryToYearly,
} from '../utils/jobUtils.js';

export const studentDetails = async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'student') {
      return res
        .status(403)
        .json({ message: 'Only students can create student profile' });
    }

    let student = await Student.findById(_id);
    if (!student) {
      try {
        student = await Student.create({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        });
      } catch (createError) {
        if (createError.code === 11000) {
          student = await Student.findById(_id);
          if (!student) {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }

    return res.status(200).json({
      studentDetails: student,
      fromCache: false,
    });
  } catch (error) {
    console.error('Error creating student details:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate data error. Please try again.',
        error: 'Duplicate key violation',
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// update Full Name
export const updateFullName = async (req, res) => {
  const { fullName, phone, email } = req.body;
  const { _id } = req.user;

  let result;

  try {
    // Atomic update operation
    if (fullName) {
      result = await Student.findByIdAndUpdate(
        _id,
        {
          $set: {
            fullName: fullName,
            updatedAt: new Date(), // Optional: add update timestamp
          },
        },
        { new: true }, // Return the updated document
      );
    } else if (phone) {
      result = await Student.findByIdAndUpdate(
        _id,
        {
          $set: {
            phone: phone,
            updatedAt: new Date(), // Optional: add update timestamp
          },
        },
        { new: true }, // Return the updated document
      );
    } else if (email) {
      result = await Student.findByIdAndUpdate(
        _id,
        {
          $set: {
            email: email,
            updatedAt: new Date(), // Optional: add update timestamp
          },
        },
        { new: true }, // Return the updated document
      );
    }

    if (!result) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      message: 'Full name updated successfully',
      updatedStudent: {
        fullName: result.fullName,
        // Include other fields you want to return
      },
    });
  } catch (error) {
    console.error('Error updating full name:', error);

    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// update Job Role
export const updateJobRole = async (req, res) => {
  const { jobRole } = req.body;
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    student.jobRole = jobRole;
    await student.save();
    res.status(200).json({ message: 'Job role updated successfully' });
  } catch (error) {
    console.error('Error updating job role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Skills controller
export const addStudentSkills = async (req, res) => {
  const { skill, level } = req.body;
  const { _id } = req.user;

  if (!skill || !level) {
    return res.status(400).json({ message: 'Skill and level are required' });
  }

  try {
    const skillId = slugify(`${skill}-${level}`, { lower: true });
    const newSkill = { skill, level, skillId };

    const result = await Student.findByIdAndUpdate(
      _id,
      { $addToSet: { skills: newSkill } },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Skill added successfully',
      skills: result.skills,
    });
  } catch (error) {
    console.error('Error adding skills:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const removeStudentSkills = async (req, res) => {
  const { skillId } = req.params;
  const { _id } = req.user;

  if (!skillId) {
    return res.status(400).json({ message: 'Skill ID is required' });
  }

  try {
    const result = await Student.findByIdAndUpdate(
      _id,
      { $pull: { skills: { _id: skillId } } },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Skill removed successfully',
      skills: result.skills,
    });
  } catch (error) {
    console.error('Error removing skill:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid skill ID format' });
    }
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateStudentSkills = async (req, res) => {
  const { skillId } = req.params;
  const { level } = req.body;
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const skill = student.skills.find((s) => s.skillId === skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    skill.level = level;
    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    res.status(200).json({ message: 'Skills updated successfully' });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Experience controller
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

    const experienceYrs = calculateExperience(
      startDate,
      endDate,
      currentlyWorking,
    );

    student.experience.push({
      experienceId,
      company,
      title,
      startDate,
      endDate,
      description,
      currentlyWorking,
      experienceYrs,
    });

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

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
      (exp) => exp._id.toString() !== experienceId,
    );

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    res.status(200).json({ message: 'Experience removed successfully' });
  } catch (error) {
    console.error('Error removing experience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateExperience = async (req, res) => {
  const { expId: experienceId } = req.params;
  const {
    company,
    title,
    employmentType,
    designation: jobType,
    startDate,
    endDate,
    description,
    experienceYrs,
    location,
    currentlyWorking,
  } = req.body;

  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const experience = student.experience.find((exp) => {
      return exp._id.toString() === experienceId;
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    // Update experience fields
    experience.company = company;
    experience.title = title;
    experience.startDate = startDate;
    experience.endDate = endDate;
    experience.description = description;
    experience.currentlyWorking = currentlyWorking;
    experience.experienceYrs = experienceYrs;
    experience.location = location;
    experience.designation = jobType;

    if (employmentType) experience.employmentType = employmentType;
    if (currentlyWorking === false) experience.endDate = null;

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    res.status(200).json({ message: 'Experience updated successfully' });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Education controller
export const addEducations = async (req, res) => {
  const {
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    gpa: grade,
    country,
    institution: institute,
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
      country,
      isCurrentlyStudying,
    });

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

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

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    res.status(200).json({ message: 'Education removed successfully' });
  } catch (error) {
    console.error('Error removing education:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEducation = async (req, res) => {
  const { eduId: educationId } = req.params;
  const {
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    country,
    gpa: grade,
    institution: institute,
    isCurrentlyStudying,
  } = req.body;
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const education = student.education.find((edu) => {
      return edu.educationId === educationId;
    });

    if (!education) {
      return res.status(404).json({ message: 'Education not found' });
    }

    // Update education fields
    if (degree) education.degree = degree;
    if (fieldOfStudy) education.fieldOfStudy = fieldOfStudy;
    if (startDate) education.startDate = startDate;
    if (endDate) education.endDate = endDate;
    if (grade) education.grade = grade;
    if (institute) education.institute = institute;
    if (isCurrentlyStudying !== undefined)
      education.isCurrentlyStudying = isCurrentlyStudying;
    if (isCurrentlyStudying === false) education.endDate = null;
    if (country) education.country = country;

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    res.status(200).json({ message: 'Education updated successfully' });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Projects controller
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
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
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

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({ message: 'Project added successfully' });
  } catch (error) {
    console.error('Error adding project:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProjects = async (req, res) => {
  const { projectId } = req.params;
  const {
    projectName,
    description,
    startDate,
    endDate,
    technologies,
    link,
    isWorkingActive,
  } = req.body;
  const { _id } = req.user;

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    const result = await Student.findOneAndUpdate(
      {
        _id: _id,
        'projects._id': projectId,
      },
      {
        $set: {
          'projects.$.projectName': projectName,
          'projects.$.description': description,
          'projects.$.startDate': startDate,
          'projects.$.endDate': endDate,
          'projects.$.technologies': technologies,
          'projects.$.link': link,
          'projects.$.isWorkingActive': isWorkingActive,
          'projects.$.updatedAt': new Date(),
        },
      },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({
        message: 'Student or project not found',
      });
    }

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Project updated successfully',
      project: result.projects.find((p) => p._id.toString() === projectId),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const removeProject = async (req, res) => {
  const { projectId } = req.params;
  const { _id } = req.user;

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      { $pull: { projects: { _id: projectId } } },
      { new: true },
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Project removed successfully',
      remainingProjects: updatedStudent.projects,
    });
  } catch (error) {
    console.error('Error removing project:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Profile image
export const addProfileImage = async (req, res) => {
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
      fs.unlinkSync(localFilePath);
      return res.status(404).json({ message: 'Student not found' });
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'student-profile-images',
    });

    student.profileImage = result.secure_url;
    await student.save();

    safeUnlink(localFilePath);

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

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

    if (student.profileImagePublicId) {
      await cloudinary.uploader.destroy(student.profileImagePublicId);
    }

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: 'student-profile-images',
    });

    student.profileImage = uploadResult.secure_url;
    student.profileImagePublicId = uploadResult.public_id;
    await student.save();

    safeUnlink(localFilePath);

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

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

    if (student.resumePublicId) {
      await cloudinary.uploader.destroy(student.resumePublicId);
    }

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: 'student-resumes',
    });

    student.resumeUrl = uploadResult.secure_url;
    student.resumePublicId = uploadResult.public_id;
    await student.save();

    safeUnlink(localFilePath);

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

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
  const { _id } = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    // Use findById for single document lookup

    const student = await Student.findById(_id);
    const job = await Job.findById(jobId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (
      student.appliedJobs.some(
        (appliedJob) => appliedJob.job.toString() === jobId,
      )
    ) {
      return res.status(400).json({
        message: 'You have already applied for this job',
      });
    }

    // Add the student and job to the respective arrays
    student.appliedJobs.push({ job: jobId });
    job.appliedStudents.push(student._id);

    // Save both documents
    await Promise.all([student.save(), job.save()]);

    return res.status(200).json({
      message: 'Job applied successfully',
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message,
      });
    }
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateStatus = async (req, res) => {
  const { jobId } = req.params;
  const { status } = req.body;
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if applied
    const appliedJob = student.appliedJobs.find(
      (job) => job.job.toString() === jobId,
    );
    if (!appliedJob) {
      return res
        .status(400)
        .json({ message: 'You have not applied for this job' });
    }

    // Update status
    appliedJob.status = status;
    await student.save();

    // Invalidate relevant caches
    await redisClient.invalidateStudentCache(_id);
    await redisClient.del(`student:${_id}:appliedJobs`);
    await redisClient.del(`student:${_id}:jobStatus:${jobId}`);

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const isAppliedOrNot = async (req, res) => {
  const { jobId } = req.query;
  const { _id } = req.user;
  const cacheKey = `student:${_id}:isApplied:${jobId}`;

  try {
    const result = await redisClient.withCache(cacheKey, 600, async () => {
      const student = await Student.findById(_id);
      if (!student) throw new Error('Student not found');

      return student.appliedJobs.some((job) => job.job.toString() === jobId);
    });

    return res.status(200).json({ isApplied: result });
  } catch (error) {
    console.error('Error checking application status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAppliedJobs = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = `student:${_id}:appliedJobs`;

  try {
    const appliedJobs = await redisClient.withCache(
      cacheKey,
      1800,
      async () => {
        const student = await Student.findById(_id).populate({
          path: 'appliedJobs.job',
          select: '-__v',
          options: { lean: true },
        });

        if (!student) throw new Error('Student not found');
        return student.appliedJobs;
      },
    );

    return res.status(200).json({ appliedJobs });
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const StudentAnalytics = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = `student:${_id}:analytics`;

  try {
    const analytics = await redisClient.withCache(cacheKey, 3600, async () => {
      const [student, studentReferal] = await Promise.all([
        Student.findById(_id, 'appliedJobs savedJobs htmlCV coverLetter'),
        User.findById(_id, 'referralCount referralCode isEmailVerified'),
      ]);

      if (!student) throw new Error('Student not found');

      return {
        applicationsSent: student.appliedJobs.length,
        savedJobsCount: student.savedJobs.length,
        cvsGenerated: student.htmlCV.length,
        coverLettersGenerated: student.coverLetter.length,
        referralCount: studentReferal?.referralCount || 0,
        isEmailVerified: studentReferal?.isEmailVerified || false,
        referralCode: studentReferal?.referralCode || '',
      };
    });

    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateJobPreferences = async (req, res) => {
  try {
    const studentId = req.user._id;

    const formData = req.body.formData || req.body;

    if (!formData || Object.keys(formData).length === 0) {
      return res
        .status(400)
        .json({ message: 'Missing form data in request body' });
    }

    const update = {};

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        if (
          (key === 'mustHaveSkills' || key === 'niceToHaveSkills') &&
          typeof formData[key] === 'string'
        ) {
          const skillsString = formData[key];

          if (skillsString.trim().length > 0) {
            update[`jobPreferences.${key}`] = skillsString
              .split(',')
              .map((skill) => ({
                skill: skill.trim().length > 0 ? skill.trim() : null,
              }))
              .filter((item) => item && item.skill); // Filter out any empty items
          } else {
            update[`jobPreferences.${key}`] = [];
          }
        } else if (formData[key] !== undefined) {
          update[`jobPreferences.${key}`] = formData[key];
        }
      }
    }

    // Check if there is anything to update after processing
    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid job preference data provided to update.' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: update },
      { new: true, runValidators: true }, // new: true returns the updated document
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      message: 'Job preferences updated successfully',
      preferences: student.jobPreferences,
    });
  } catch (error) {
    console.error('Error updating job preferences:', error);
    // Check for Mongoose validation or cast errors
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      return res
        .status(400)
        .json({ message: 'Invalid data provided.', error: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getJobPreferences = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:jobPreferences`;

  try {
    const preferences = await redisClient.withCache(
      cacheKey,
      86400,
      async () => {
        const student = await Student.findById(studentId).select(
          'jobPreferences',
        );
        return student?.jobPreferences || {};
      },
    );

    return res.status(200).json({ preferences });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const savedJobs = async (req, res) => {
  const studentId = req.user._id;
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required.' });
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // --- ROBUST DUPLICATE CHECK (THE FIX) ---
    // This check now handles both data formats.
    const isAlreadySaved = student.savedJobs.some((savedItem) => {
      // Check if the item is an object with a 'job' property (new format)
      if (savedItem && savedItem.job) {
        return savedItem.job.toString() === jobId;
      }
      // Otherwise, treat it as a plain ObjectId (old format)
      return savedItem.toString() === jobId;
    });

    if (isAlreadySaved) {
      return res.status(409).json({ message: 'Job already saved.' });
    }

    // Add the new job in the correct object format
    student.savedJobs.push({ job: jobId });
    await student.save();

    // Invalidate caches
    await redisClient.invalidateStudentCache(studentId);
    await redisClient.del(`student:${studentId}:savedJobs`);
    await redisClient.del(`student:${studentId}:isSaved:${jobId}`);

    return res.status(200).json({
      success: true,
      message: 'Job saved successfully.',
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSavedJobs = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = `student:${_id}:savedJobs`;

  try {
    const savedJobs = await redisClient.withCache(cacheKey, 1800, async () => {
      const student = await Student.findById(_id).populate({
        path: 'savedJobs',
        select: '-__v',
        options: { lean: true },
      });

      if (!student) throw new Error('Student not found');
      return student.savedJobs;
    });

    return res.status(200).json({ savedJobs });
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const isSavedOrNot = async (req, res) => {
  const { _id } = req.user;
  const { jobId } = req.query;
  const cacheKey = `student:${_id}:isSaved:${jobId}`;

  try {
    const isSaved = await redisClient.withCache(cacheKey, 600, async () => {
      const student = await Student.findById(_id);
      if (!student) throw new Error('Student not found');
      return student.savedJobs.some((id) => id.toString() === jobId);
    });

    return res.status(200).json({ isSaved });
  } catch (error) {
    console.error('Error checking saved status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfileCompletion = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:profileCompletion`;

  try {
    const completionData = await redisClient.withCache(
      cacheKey,
      86400,
      async () => {
        const student = await Student.findById(studentId).select(
          'fullName phone profileImage jobRole resumeUrl education experience skills projects jobPreferences coverLetter',
        );

        if (!student) throw new Error('Student not found');

        const completionStatus = {
          coreProfile: Boolean(
            student.fullName &&
              student.phone &&
              student.profileImage &&
              student.jobRole,
          ),
          resume: Boolean(student.resumeUrl),
          education: Boolean(student.education?.length > 0),
          workExperience: Boolean(student.experience?.length > 0),
          skills: Boolean(student.skills?.length >= 10),
          projects: Boolean(student.projects?.length > 0),
          jobPreferences: Boolean(
            student.jobPreferences?.preferedJobTitles?.length > 0 &&
              student.jobPreferences?.preferedSalary?.min > 0 &&
              (student.jobPreferences?.preferedCountries?.length > 0 ||
                student.jobPreferences?.preferedCities?.length > 0 ||
                student.jobPreferences?.isRemote === true),
          ),
          coverLetter: Boolean(student.coverLetter?.length > 0),
        };

        const completedCategories =
          Object.values(completionStatus).filter(Boolean).length;
        const totalCategories = Object.keys(completionStatus).length;

        return {
          percentage: Math.round((completedCategories / totalCategories) * 100),
          breakdown: { completed: completedCategories, total: totalCategories },
          categories: completionStatus,
        };
      },
    );

    return res.status(200).json(completionData);
  } catch (error) {
    console.error('Error calculating completion:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const student = await Student.findById(studentId).select('jobPreferences');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const preferences = student.jobPreferences;

    const filter = { isActive: true };

    if (preferences.isRemote) {
      filter.isRemote = true;
    } else {
      if (
        preferences.preferedCountries &&
        preferences.preferedCountries.length > 0
      ) {
        filter.country = {
          $in: preferences.preferedCountries.map((c) => new RegExp(c, 'i')),
        };
      }
      if (preferences.preferedCities && preferences.preferedCities.length > 0) {
        filter['location.city'] = {
          $in: preferences.preferedCities.map((c) => new RegExp(c, 'i')),
        };
      }
    }

    if (
      preferences.preferedJobTypes &&
      preferences.preferedJobTypes.length > 0
    ) {
      filter.jobTypes = { $in: preferences.preferedJobTypes };
    }

    if (
      preferences.preferedJobTitles &&
      preferences.preferedJobTitles.length > 0
    ) {
      filter.$or = preferences.preferedJobTitles.map((title) => ({
        title: { $regex: title, $options: 'i' },
      }));
    }

    // Salary filter
    if (preferences.preferedSalary && preferences.preferedSalary.min) {
      const minSalary = convertSalaryToYearly(
        preferences.preferedSalary.min,
        preferences.preferedSalary.period,
      );
      filter['salary.min'] = { $gte: minSalary };
    }

    // Experience level filter
    if (preferences.preferedExperienceLevel) {
      let experienceValue;
      switch (preferences.preferedExperienceLevel) {
        case 'ENTRY_LEVEL':
          experienceValue = 0;
          break;
        case 'MID_LEVEL':
          experienceValue = 3;
          break;
        case 'SENIOR':
          experienceValue = 5;
          break;
        default:
          experienceValue = 0;
      }
      filter.experience = { $lte: experienceValue };
    }

    // Must-have skills filter
    if (preferences.mustHaveSkills && preferences.mustHaveSkills.length > 0) {
      filter.$and = preferences.mustHaveSkills.map((skill) => ({
        $or: [
          { qualifications: { $regex: skill.skill, $options: 'i' } },
          { description: { $regex: skill.skill, $options: 'i' } },
          { tags: { $regex: skill.skill, $options: 'i' } },
        ],
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(filter),
    ]);

    // If no jobs found in our database, try to fetch from RapidAPI
    if (jobs.length === 0) {
      return await getFallbackJobsFromRapidAPI(req, res, preferences);
    }

    // Calculate match score for each job
    const jobsWithScores = jobs.map((job) => ({
      ...job.toObject(),
      matchScore: calculateMatchScore(job, preferences),
    }));

    // Sort by match score
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      jobs: jobsWithScores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      source: 'internal',
    });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const sendJobApplicationViaEmail = async (req, res) => {
  const {
    senderEmail,
    recieverEmail,
    htmlResume,
    htmlCoverLetter,
    subject,
    bodyHtml,
  } = req.body;

  try {
    const user = await User.findOne({ email: senderEmail }).select('tokens');
    if (!user || !user.tokens) {
      return res.status(404).send('User not found or not authorized');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(user.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Generate PDFs
    const resumePdf = await generatePdfFromHtml(htmlResume);
    const coverLetterPdf = await generatePdfFromHtml(htmlCoverLetter);

    const resumeBase64 = resumePdf.toString('base64');
    const coverLetterBase64 = coverLetterPdf.toString('base64');

    // Compose raw email message
    const messageParts = [
      `From: <${senderEmail}>`,
      `To: <${recieverEmail}>`,
      `Subject: ${subject || 'Job Application'}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="boundary123"`,
      ``,
      `--boundary123`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      bodyHtml || 'Hi, please find attached my resume and cover letter.',
      ``,
      ...createAttachment('Resume.pdf', 'application/pdf', resumeBase64),
      ...createAttachment(
        'CoverLetter.pdf',
        'application/pdf',
        coverLetterBase64,
      ),
      `--boundary123--`,
    ];

    const rawMessage = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).send(`<pre>${error.message}</pre>`);
  }
};

const createAttachment = (filename, mimeType, base64Data) => {
  return [
    `--boundary123`,
    `Content-Type: ${mimeType}; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64Data,
    ``,
  ];
};

export const toggleAutopilot = async (req, res, next) => {
  try {
    const studentId = req.user._id; // Assuming `req.user` is set by your auth middleware

    const student = await Student.findById(studentId);
    if (!student) {
      return next(createHttpError(404, 'Student not found'));
    }

    // Toggle the autopilot status
    student.settings.autopilotEnabled = !student.settings.autopilotEnabled;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Autopilot has been ${
        student.settings.autopilotEnabled ? 'enabled' : 'disabled'
      }.`,
      autopilotStatus: student.settings.autopilotEnabled,
    });
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};

// In your jobController.js

export const jobViewedByStudent = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { jobId } = req.params;

    // Check if the student has already viewed this specific job
    const student = await Student.findOne({
      _id: studentId,
      'viewedJobs.job': jobId,
    });

    // If 'student' is not null, the job is already in their viewed list
    if (student) {
      return res
        .status(200)
        .json({ success: true, message: 'Job view was already recorded.' });
    }

    // If not viewed, add the job reference to the array
    await Student.findByIdAndUpdate(studentId, {
      $push: {
        viewedJobs: { job: jobId },
      },
    });

    res
      .status(200)
      .json({ success: true, message: 'Job view recorded successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const isStudentViewedJob = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { jobId } = req.params;

    const jobExists = await Job.findById(jobId).select('_id').lean();
    if (!jobExists) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    student.isJobViewed = true; // Set the flag to true

    const isViewed = student.jobsViewed.includes(jobId);

    res.status(200).json({ success: true, isViewed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const jobVisitedByStudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;

    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const visitedJob = student.visitedJobs.find(
      (vj) => vj.job.toString() === jobId,
    );

    if (visitedJob) {
      visitedJob.visitedAt = new Date();
    } else {
      student.visitedJobs.push({ job: jobId });
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Job marked as visited successfully.',
      job: {
        _id: jobExists._id,
        title: jobExists.title,
        salary: jobExists.salary,
        location: jobExists.location,
        jobTypes: jobExists.jobTypes,
        company: jobExists.company,
      },
    });
  } catch (error) {
    console.error('Error in jobVisitedByStudent:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const isJobVisitedByStudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      isVisited: student.visitedJobs.some(
        (visitedJob) => visitedJob.job.toString() === jobId,
      ),
    });
  } catch (error) {
    console.error('Error in jobNotVisitedByStudent:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllVisitedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await Student.findById(studentId)
      .select('visitedJobs')
      .populate({
        path: 'visitedJobs.job',
        select: 'title company salary location jobTypes', // Specify which job fields to return
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      jobs: student.visitedJobs,
    });
  } catch (error) {
    console.error('Error in jobNotVisitedByStudent:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllViewedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await Student.findById(studentId)
      .select('viewedJobs')
      .populate({
        path: 'viewedJobs.job',
        select: 'title company salary location jobTypes', // Specify which job fields to return
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      jobs: student.viewedJobs, // This now contains the full job details
    });
  } catch (error) {
    console.error('Error fetching viewed jobs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllSavedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await Student.findById(studentId)
      .select('savedJobs')
      .populate({
        path: 'savedJobs.job',
        select: 'title company salary location jobTypes', // Specify which job fields to return
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      jobs: student.savedJobs,
    });
  } catch (error) {
    console.error('Error in jobNotVisitedByStudent:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllStatCounts = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      statCounts: {
        viewedJobsCount: student.viewedJobs.length,
        visitedJobsCount: student.visitedJobs.length,
        savedJobsCount: student.savedJobs.length,
        appliedJobsCount: 0,
      },
    });
  } catch (error) {
    console.error('Error in getAllStatCounts:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
