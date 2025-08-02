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
import axios from 'axios';
import {
  extractExperience,
  extractQualificationsFromDescription,
  extractResponsibilitiesFromDescription,
} from '../utils/exprienceExtractor.js';

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

    const existingStudent = await Student.findOne({ _id: user._id });
    console.log(existingStudent);
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
    return res.status(500).json({ message: 'Internal server error', error });
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

export const updateFullName = async (req, res) => {
  const { fullName } = req.body;
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    student.fullName = fullName;
    await student.save();
    res.status(200).json({ message: 'Full name updated successfully' });
  } catch (error) {
    console.error('Error updating full name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
    console.log(skill.level);
    skill.level = level;
    await student.save();
    res.status(200).json({ message: 'Skills updated successfully' });
  } catch (error) {
    console.error('Error updating skills:', error);
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

export const updateExperience = async (req, res) => {
  const { expId: experienceId } = req.params;
  const { company, title, startDate, endDate, description, currentlyWorking } =
    req.body;
  const { _id } = req.user;
  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const experience = student.experience.find(
      (exp) => exp.experienceId === experienceId,
    );
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    experience.company = company;
    experience.title = title;
    experience.startDate = startDate;
    experience.endDate = endDate;
    experience.description = description;
    experience.currentlyWorking = currentlyWorking;

    await student.save();
    res.status(200).json({ message: 'Experience updated successfully' });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
  console.log(req.body);
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

    student.education = student.education.filter((edu) => {
      return edu.educationId !== educationId;
    });
    student.education.push(education);

    student.education.sort((a, b) => {
      return new Date(b.startDate) - new Date(a.startDate);
    });

    await student.save();
    res.status(200).json({ message: 'Education updated successfully' });
  } catch (error) {
    console.error('Error updating education:', error);
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
  const { _id } = req.user;

  try {
    // Validate jobId format if using MongoDB
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    // Find student and job in parallel for better performance
    const [student, job] = await Promise.all([
      Student.findById(_id),
      Job.findById(jobId),
    ]);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if already applied - now checking the job field of each object
    if (student.appliedJobs.some((appliedJob) => appliedJob.job === jobId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Handle potential validation errors
    try {
      // Push an object with job field instead of just the ID
      student.appliedJobs.push({ job: jobId });
      job.appliedStudents.push(student._id);

      // Save both in parallel
      await Promise.all([student.save(), job.save()]);

      return res.status(200).json({
        success: true,
        message: 'Job applied successfully',
      });
    } catch (saveError) {
      // Handle validation errors specifically
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: saveError.message,
        });
      }
      throw saveError; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error applying for job:', error);
    return res.status(500).json({
      success: false,
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
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if already applied - now checking the job field of each object
    if (!student.appliedJobs.some((appliedJob) => appliedJob.job === jobId)) {
      return res.status(400).json({
        success: false,
        message: 'You have not applied for this job',
      });
    }

    // Update status
    student.appliedJobs.forEach((appliedJob) => {
      if (appliedJob.job === jobId) {
        appliedJob.status = status;
      }
    });

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const isAppliedOrNot = async (req, res) => {
  const { jobId } = req.query;
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    const isApplied = student.appliedJobs.some((id) => id.toString() === jobId);

    return res.status(200).json({
      success: true,
      isApplied,
    });
  } catch (error) {
    console.error('Error checking if applied:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAppliedJobs = async (req, res) => {
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id).populate({
      path: 'appliedJobs.job',
      select: '-__v',
      options: { lean: true },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({
      success: true,
      appliedJobs: student.appliedJobs,
    });
  } catch (error) {
    console.error('Error getting applied jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
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

export const createJobPreference = async (req, res) => {
  try {
    const {
      // Location
      preferedCountries,
      preferedCities,
      isRemote,
      relocationWillingness,

      // Job Details
      preferedJobTitles,
      preferedJobTypes,
      preferedIndustries,
      preferedExperienceLevel,

      // Compensation
      preferedSalary,

      // Skills
      mustHaveSkills,
      niceToHaveSkills,
      preferedCertifications,
      preferedEducationLevel,

      // Company
      preferedCompanySizes,
      preferedCompanyCultures,

      // Additional
      visaSponsorshipRequired,
      immediateAvailability,
    } = req.body;

    console.log(req.body);

    // Validate must-have skills structure
    if (mustHaveSkills && Array.isArray(mustHaveSkills)) {
      for (const skill of mustHaveSkills) {
        if (!skill.skill || !skill.level) {
          return res.status(400).json({
            message: 'Must-have skills must have both skill name and level',
          });
        }
      }
    }

    // Build update object
    const update = {};
    const fields = [
      'preferedCountries',
      'preferedCities',
      'isRemote',
      'relocationWillingness',
      'preferedJobTitles',
      'preferedJobTypes',
      'preferedIndustries',
      'preferedExperienceLevel',
      'preferedSalary',
      'mustHaveSkills',
      'niceToHaveSkills',
      'preferedCertifications',
      'preferedEducationLevel',
      'preferedCompanySizes',
      'preferedCompanyCultures',
      'visaSponsorshipRequired',
      'immediateAvailability',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[`jobPreferences.${field}`] = req.body[field];
      }
    });

    // Update student with validation
    const student = await Student.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      {
        new: true,
        runValidators: true,
        select: 'jobPreferences',
      },
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

    // Handle specific error types
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        message: 'Validation error',
        errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data type provided',
        field: error.path,
        expectedType: error.kind,
      });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getJobPreferences = async (req, res) => {
  try {
    // Explicitly select the jobPreferences field
    const student = await Student.findById(req.user._id).select(
      'jobPreferences',
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return empty object if no preferences exist yet
    const preferences = student.jobPreferences || {};

    return res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error getting job preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const savedJobs = async (req, res) => {
  const { _id } = req.user;
  const { jobId } = req.body;

  try {
    // Atomically update only the savedJobs array
    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      { $addToSet: { savedJobs: jobId } }, // Adds jobId only if it's not already there
      { new: true, runValidators: false }, // `new: true` returns the updated doc
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      success: true,
      savedJobs: updatedStudent.savedJobs,
    });
  } catch (error) {
    // The console error name is more accurate now
    console.error('Error saving job:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const { _id } = req.user;

    // Validate user ID
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Find student with populated savedJobs
    const student = await Student.findById(_id).populate({
      path: 'savedJobs',
      select: '-__v', // Exclude version key
      options: { lean: true }, // Return plain JavaScript objects
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // If you want to transform the data before sending
    const savedJobs = student.savedJobs.map((job) => ({
      ...(job.toObject ? job.toObject() : job), // Handle both mongoose docs and lean objects
      // Add any transformations here
    }));

    return res.status(200).json({
      success: true,
      data: savedJobs, // Better to wrap in a 'data' property
      count: savedJobs.length, // Useful metadata
    });
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const isSavedOrNot = async (req, res) => {
  try {
    const { _id } = req.user;
    const { jobId } = req.query;

    console.log(_id, jobId);

    // Validate inputs
    if (!_id || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Both user ID and job ID are required',
      });
    }

    // Check if jobId is a valid ObjectId if you're using MongoDB
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const student = await Student.findById(_id).select('savedJobs');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Convert to string for comparison (MongoDB ObjectIds need special handling)
    const isSaved = student.savedJobs.some(
      (savedJob) => savedJob.toString() === jobId,
    );

    return res.status(200).json({
      success: true,
      isSaved,
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while checking saved status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// export const getRecommendedJobs = async (req, res) => {
//   try {
//     const studentId = req.user._id;
//     const { page = 1, limit = 10 } = req.query;

//     // Get student preferences
//     const student = await Student.findById(studentId).select('jobPreferences');
//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: 'Student not found',
//       });
//     }

//     const preferences = student.jobPreferences;

//     // Build the filter based on preferences
//     const filter = { isActive: true };

//     // Location filters
//     if (preferences.isRemote) {
//       filter.isRemote = true;
//     } else {
//       if (
//         preferences.preferedCountries &&
//         preferences.preferedCountries.length > 0
//       ) {
//         filter.country = {
//           $in: preferences.preferedCountries.map((c) => new RegExp(c, 'i')),
//         };
//       }
//       if (preferences.preferedCities && preferences.preferedCities.length > 0) {
//         filter['location.city'] = {
//           $in: preferences.preferedCities.map((c) => new RegExp(c, 'i')),
//         };
//       }
//     }

//     // Job type filters
//     if (
//       preferences.preferedJobTypes &&
//       preferences.preferedJobTypes.length > 0
//     ) {
//       filter.jobTypes = { $in: preferences.preferedJobTypes };
//     }

//     // Job title filters
//     if (
//       preferences.preferedJobTitles &&
//       preferences.preferedJobTitles.length > 0
//     ) {
//       filter.$or = preferences.preferedJobTitles.map((title) => ({
//         title: { $regex: title, $options: 'i' },
//       }));
//     }

//     // Salary filter
//     if (preferences.preferedSalary && preferences.preferedSalary.min) {
//       // Convert to yearly if needed for comparison
//       const minSalary = convertSalaryToYearly(
//         preferences.preferedSalary.min,
//         preferences.preferedSalary.period,
//       );

//       filter['salary.min'] = { $gte: minSalary };
//     }

//     // Experience level filter
//     if (preferences.preferedExperienceLevel) {
//       let experienceValue;
//       switch (preferences.preferedExperienceLevel) {
//         case 'ENTRY_LEVEL':
//           experienceValue = 0;
//           break;
//         case 'MID_LEVEL':
//           experienceValue = 3;
//           break;
//         case 'SENIOR':
//           experienceValue = 5;
//           break;
//         default:
//           experienceValue = 0;
//       }
//       filter.experience = { $lte: experienceValue };
//     }

//     // Company size filter
//     if (
//       preferences.preferedCompanySizes &&
//       preferences.preferedCompanySizes.length > 0
//     ) {
//       filter['company.size'] = { $in: preferences.preferedCompanySizes };
//     }

//     // Must-have skills filter
//     if (preferences.mustHaveSkills && preferences.mustHaveSkills.length > 0) {
//       filter.$and = preferences.mustHaveSkills.map((skill) => ({
//         $or: [
//           { qualifications: { $regex: skill.skill, $options: 'i' } },
//           { description: { $regex: skill.skill, $options: 'i' } },
//           { tags: { $regex: skill.skill, $options: 'i' } },
//         ],
//       }));
//     }

//     // Visa sponsorship filter
//     if (preferences.visaSponsorshipRequired) {
//       filter.visaSponsorshipAvailable = true;
//     }

//     console.log(preferences);

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const [jobs, total] = await Promise.all([
//       Job.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parseInt(limit)),
//       Job.countDocuments(filter),
//     ]);

//     // Calculate match score for each job
//     const jobsWithScores = jobs.map((job) => ({
//       ...job.toObject(),
//       matchScore: calculateMatchScore(job, preferences),
//     }));

//     // Sort by match score
//     jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

//     res.status(200).json({
//       success: true,
//       jobs: jobsWithScores,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching recommended jobs:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };

// // Helper function to convert salary to yearly for comparison
// function convertSalaryToYearly(amount, period) {
//   switch (period) {
//     case 'HOUR':
//       return amount * 40 * 52; // 40 hours/week * 52 weeks
//     case 'DAY':
//       return amount * 5 * 52; // 5 days/week * 52 weeks
//     case 'WEEK':
//       return amount * 52;
//     case 'MONTH':
//       return amount * 12;
//     case 'YEAR':
//     default:
//       return amount;
//   }
// }

// // Helper function to calculate match score (0-100)
// function calculateMatchScore(job, preferences) {
//   let score = 0;
//   const totalPossible = 100;
//   let points = 0;

//   // Location match (20 points)
//   if (preferences.isRemote && job.isRemote) {
//     points += 20;
//   } else if (
//     preferences.preferedCountries &&
//     preferences.preferedCountries.length > 0
//   ) {
//     if (
//       preferences.preferedCountries.some((c) =>
//         job.country.toLowerCase().includes(c.toLowerCase()),
//       )
//     ) {
//       points += 10;
//       if (preferences.preferedCities && preferences.preferedCities.length > 0) {
//         if (
//           preferences.preferedCities.some((c) =>
//             job.location.city.toLowerCase().includes(c.toLowerCase()),
//           )
//         ) {
//           points += 10;
//         }
//       }
//     }
//   }

//   // Job type match (15 points)
//   if (preferences.preferedJobTypes && job.jobTypes) {
//     const matchingTypes = job.jobTypes.filter((type) =>
//       preferences.preferedJobTypes.includes(type),
//     );
//     if (matchingTypes.length > 0) {
//       points += 15;
//     }
//   }

//   // Title match (15 points)
//   if (
//     preferences.preferedJobTitles &&
//     preferences.preferedJobTitles.length > 0
//   ) {
//     if (
//       preferences.preferedJobTitles.some((title) =>
//         job.title.toLowerCase().includes(title.toLowerCase()),
//       )
//     ) {
//       points += 15;
//     }
//   }

//   // Salary match (15 points)
//   if (preferences.preferedSalary && job.salary) {
//     const prefMinYearly = convertSalaryToYearly(
//       preferences.preferedSalary.min,
//       preferences.preferedSalary.period,
//     );
//     const jobMinYearly = convertSalaryToYearly(
//       job.salary.min || 0,
//       job.salary.period || 'YEAR',
//     );

//     if (jobMinYearly >= prefMinYearly) {
//       points += 15;
//     } else if (jobMinYearly >= prefMinYearly * 0.8) {
//       points += 10;
//     } else if (jobMinYearly >= prefMinYearly * 0.6) {
//       points += 5;
//     }
//   }

//   // Skills match (20 points)
//   if (preferences.mustHaveSkills && preferences.mustHaveSkills.length > 0) {
//     const jobText = `${job.description} ${job.qualifications.join(
//       ' ',
//     )} ${job.tags.join(' ')}`.toLowerCase();
//     const matchedSkills = preferences.mustHaveSkills.filter((skill) =>
//       jobText.includes(skill.skill.toLowerCase()),
//     );
//     points += (matchedSkills.length / preferences.mustHaveSkills.length) * 20;
//   }

//   // Experience match (10 points)
//   if (preferences.preferedExperienceLevel) {
//     let prefExpLevel;
//     switch (preferences.preferedExperienceLevel) {
//       case 'ENTRY_LEVEL':
//         prefExpLevel = 0;
//         break;
//       case 'MID_LEVEL':
//         prefExpLevel = 3;
//         break;
//       case 'SENIOR':
//         prefExpLevel = 5;
//         break;
//       default:
//         prefExpLevel = 0;
//     }

//     if (job.experience <= prefExpLevel) {
//       points += 10;
//     } else if (job.experience <= prefExpLevel + 2) {
//       points += 5;
//     }
//   }

//   // Visa sponsorship (5 points)
//   if (preferences.visaSponsorshipRequired && job.visaSponsorshipAvailable) {
//     points += 5;
//   }

//   return Math.min(Math.round((points / totalPossible) * 100), 100);
// }

export const getRecommendedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    // Get student preferences
    const student = await Student.findById(studentId).select('jobPreferences');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const preferences = student.jobPreferences;

    // Build the filter based on preferences
    const filter = { isActive: true };

    // Location filters
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

    // Job type filters
    if (
      preferences.preferedJobTypes &&
      preferences.preferedJobTypes.length > 0
    ) {
      filter.jobTypes = { $in: preferences.preferedJobTypes };
    }

    // Job title filters
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

async function getFallbackJobsFromRapidAPI(req, res, preferences) {
  try {
    console.log('Fetching jobs from RapidAPI...');
    let queryParts = [];

    // Build query based on preferences
    if (preferences.preferedJobTitles?.length > 0) {
      queryParts.push(`(${preferences.preferedJobTitles.join(' OR ')})`);
    }

    if (preferences.mustHaveSkills?.length > 0) {
      queryParts.push(
        `(${preferences.mustHaveSkills.map((s) => s.skill).join(' OR ')})`,
      );
    }

    if (!preferences.isRemote && preferences.preferedCountries?.length > 0) {
      queryParts.push(
        `location:(${preferences.preferedCountries.join(' OR ')})`,
      );
    }

    const query = queryParts.join(' AND ') || 'Software Engineer';

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query,
        page: req.query.page || 1,
        num_pages: 20,
      },
      headers: {
        'X-RapidAPI-Key': '0d3678f4demsh0fdb835e7b93d0cp15bf60jsnd8ee05c7fc47',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    const externalJobs = response.data.data || [];
    const processedJobs = [];

    for (const job of externalJobs) {
      const existing = await Job.findOne({ jobId: job.job_id });
      const experience = extractExperience(job.job_description);
      const qualifications = extractQualificationsFromDescription(
        job.job_description,
      );
      const responsibilities = extractResponsibilitiesFromDescription(
        job.job_description,
      );

      if (!existing) {
        const newJob = new Job({
          jobId: job.job_id,
          origin: 'EXTERNAL',
          logo: job.employer_logo,
          experience,
          qualification: qualifications,
          responsibilities,
          title: job.job_title,
          description: job.job_description,
          jobTypes: job.job_employment_types || [],
          company: job.employer_name,
          applyMethod: {
            method: 'URL',
            url: job.job_apply_link,
          },
          salary: {
            min: job.job_min_salary || 0,
            max: job.job_max_salary || 0,
            period: job.job_salary_period || 'YEAR',
          },
          location: {
            city: job.job_city,
            postalCode: job.job_postal_code || '',
            lat: job.job_latitude,
            lng: job.job_longitude,
          },
          jobAddress: job.job_location,
          country: job.job_country,
          tags: job.job_benefits || [],
          queries: [query],
        });

        const savedJob = await newJob.save();
        processedJobs.push(savedJob);
      } else {
        await Job.updateOne(
          { jobId: job.job_id },
          { $addToSet: { queries: query } },
        );
        processedJobs.push(existing); // Include existing one for scoring
      }
    }

    // Add match scores and sort
    const jobsWithScores = processedJobs.map((job) => ({
      ...job.toObject(),
      matchScore: calculateMatchScore(job, preferences),
    }));

    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Pagination
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const paginatedJobs = jobsWithScores.slice(
      (page - 1) * limit,
      page * limit,
    );

    return res.status(200).json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        total: jobsWithScores.length,
        page,
        limit,
        totalPages: Math.ceil(jobsWithScores.length / limit),
      },
      source: 'external',
      message:
        jobsWithScores.length > 0
          ? 'Showing external job listings that match your preferences'
          : 'No matching jobs found in our database or external sources',
    });
  } catch (error) {
    console.error('Error fetching fallback jobs from RapidAPI:', error.message);
    return res.status(200).json({
      success: true,
      jobs: [],
      pagination: {
        total: 0,
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 10),
        totalPages: 0,
      },
      source: 'none',
      message:
        'No matching jobs found. Try adjusting your preferences or check back later.',
    });
  }
}

// Helper function to convert salary to yearly for comparison
function convertSalaryToYearly(amount, period) {
  switch (period) {
    case 'HOUR':
      return amount * 40 * 52;
    case 'DAY':
      return amount * 5 * 52;
    case 'WEEK':
      return amount * 52;
    case 'MONTH':
      return amount * 12;
    case 'YEAR':
    default:
      return amount;
  }
}

// Helper function to calculate match score (0-100)
function calculateMatchScore(job, preferences) {
  let score = 0;
  const totalPossible = 100;
  let points = 0;

  // Location match (20 points)
  if (preferences.isRemote && job.isRemote) {
    points += 20;
  } else if (
    preferences.preferedCountries &&
    preferences.preferedCountries.length > 0
  ) {
    if (
      preferences.preferedCountries.some(
        (c) =>
          job.country && job.country.toLowerCase().includes(c.toLowerCase()),
      )
    ) {
      points += 10;
      if (preferences.preferedCities && preferences.preferedCities.length > 0) {
        if (
          preferences.preferedCities.some(
            (c) =>
              job.location?.city &&
              job.location.city.toLowerCase().includes(c.toLowerCase()),
          )
        ) {
          points += 10;
        }
      }
    }
  }

  // Job type match (15 points)
  if (preferences.preferedJobTypes && job.jobTypes) {
    const matchingTypes = job.jobTypes.filter((type) =>
      preferences.preferedJobTypes.includes(type),
    );
    if (matchingTypes.length > 0) {
      points += 15;
    }
  }

  // Title match (15 points)
  if (
    preferences.preferedJobTitles &&
    preferences.preferedJobTitles.length > 0
  ) {
    if (
      preferences.preferedJobTitles.some(
        (title) =>
          job.title && job.title.toLowerCase().includes(title.toLowerCase()),
      )
    ) {
      points += 15;
    }
  }

  // Salary match (15 points)
  if (preferences.preferedSalary && job.salary) {
    const prefMinYearly = convertSalaryToYearly(
      preferences.preferedSalary.min,
      preferences.preferedSalary.period,
    );
    const jobMinYearly = convertSalaryToYearly(
      job.salary.min || 0,
      job.salary.period || 'YEAR',
    );

    if (jobMinYearly >= prefMinYearly) {
      points += 15;
    } else if (jobMinYearly >= prefMinYearly * 0.8) {
      points += 10;
    } else if (jobMinYearly >= prefMinYearly * 0.6) {
      points += 5;
    }
  }

  // Skills match (20 points)
  if (preferences.mustHaveSkills && preferences.mustHaveSkills.length > 0) {
    const jobText = [
      job.description || '',
      ...(job.qualifications || []),
      ...(job.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    const matchedSkills = preferences.mustHaveSkills.filter((skill) =>
      jobText.includes(skill.skill.toLowerCase()),
    );
    points += (matchedSkills.length / preferences.mustHaveSkills.length) * 20;
  }

  // Experience match (10 points)
  if (preferences.preferedExperienceLevel) {
    let prefExpLevel;
    switch (preferences.preferedExperienceLevel) {
      case 'ENTRY_LEVEL':
        prefExpLevel = 0;
        break;
      case 'MID_LEVEL':
        prefExpLevel = 3;
        break;
      case 'SENIOR':
        prefExpLevel = 5;
        break;
      default:
        prefExpLevel = 0;
    }

    if (job.experience <= prefExpLevel) {
      points += 10;
    } else if (job.experience <= prefExpLevel + 2) {
      points += 5;
    }
  }

  // Visa sponsorship (5 points)
  if (preferences.visaSponsorshipRequired && job.visaSponsorshipAvailable) {
    points += 5;
  }

  return Math.min(Math.round((points / totalPossible) * 100), 100);
}
