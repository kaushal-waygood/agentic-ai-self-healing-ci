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
import axios from 'axios';
import { config } from '../config/config.js';

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

export const onboardingProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { data, selectedOptions } = req.body;

    // 1. Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (data.fullName) student.fullName = data.fullName;
    if (data.email) student.email = data.email;
    if (data.phone) student.phone = data.phone;
    if (data.designation) student.jobRole = data.designation;

    if (data.education && Array.isArray(data.education)) {
      student.education = data.education.map((edu) => ({
        educationId: slugify(`${edu.degree}-${edu.institute}`, { lower: true }), // Generate a unique ID for each entry
        institute: edu.institute,
        degree: edu.degree,
        grade: edu.grade,
        // Map graduationYear to endDate for schema consistency
        endDate: edu.graduationYear ? edu.graduationYear.toString() : null,
      }));
    }

    // 4. Transform and Update Experience Array
    if (data.experience && Array.isArray(data.experience)) {
      student.experience = data.experience.map((exp) => {
        // Basic parsing for "start - end" or "start - Present" duration
        const durationParts = exp.duration
          ? exp.duration.split(' - ')
          : [null, null];
        return {
          experienceId: slugify(`${exp.company}-${exp.title}`, { lower: true }),
          company: exp.company,
          title: exp.title,
          description: exp.description,
          startDate: durationParts[0] || null,
          endDate:
            durationParts[1] && durationParts[1].toLowerCase() !== 'present'
              ? durationParts[1]
              : null,
          currentlyWorking:
            durationParts[1] && durationParts[1].toLowerCase() === 'present',
        };
      });
    }

    // 5. Transform and Update Skills Array
    if (data.skills && Array.isArray(data.skills)) {
      student.skills = data.skills.map((skill) => ({
        skillId: slugify(`${skill.skill}-${skill.level}-${Date.now()}`, {
          lower: true,
        }),
        skill: skill.skill,
        level: skill.level || 'BEGINNER',
      }));
    }

    // 6. Transform and Update Projects Array
    if (data.projects && Array.isArray(data.projects)) {
      student.projects = data.projects.map((proj) => ({
        projectName: proj.projectName,
        description: proj.description,
        link: proj.link,
        // Transform comma-separated string back into an array
        technologies: proj.technologies
          ? proj.technologies.split(',').map((t) => t.trim())
          : [],
      }));
    }

    // 7. Update Job Preferences Sub-document
    // Ensure the sub-document exists before assigning to it
    student.jobPreferences = student.jobPreferences || {};
    student.jobPreferences.preferredJobTypes = selectedOptions.jobType || [];
    student.jobPreferences.immediateAvailability =
      selectedOptions.availability === 'Immediately';

    if (data.location) {
      student.jobPreferences.preferredCities = data.location
        .split(',')
        .map((city) => city.trim());
    }
    if (data.expectedSalary) {
      student.jobPreferences.preferredSalary = {
        min: parseInt(data.expectedSalary, 10) || null,
        currency: 'USD', // or derive from user location/input
        period: 'YEAR',
      };
    }

    // 8. Mark Onboarding as Complete and Save
    student.hasCompletedOnboarding = true;
    await student.save();

    // 9. Send Success Response
    return res.status(200).json({
      message: 'Profile updated successfully!',
      hasCompletedOnboarding: student.hasCompletedOnboarding,
    });
  } catch (error) {
    console.error('Error updating onboarding profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find the user and update the flag to true
    await Student.findByIdAndUpdate(studentId, {
      hasCompletedOnboarding: true,
    });

    // It's good practice to clear any cached user data
    const cacheKey = `student:${studentId}:profileCompletion`;
    await redisClient.del(cacheKey); // Or any other relevant user caches

    res.status(200).json({
      success: true,
      message: 'Onboarding status updated successfully.',
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ message: 'Internal server error' });
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
export const getEducationsById = async (req, res) => {
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ educations: student.education });
  } catch (error) {
    console.error('Error getting educations:', error);
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
  try {
    const { eduId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!eduId) {
      return res.status(400).json({ message: 'Education id is required' });
    }

    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const edu = student.education.id(eduId);
    if (!edu) {
      return res.status(404).json({ message: 'Education not found' });
    }

    // remove the subdocument and save
    edu.deleteOne(); // or edu.remove() in older Mongoose
    await student.save();

    return res.status(200).json({
      message: 'Education removed successfully',
      removedId: eduId,
    });
  } catch (error) {
    console.error('Error removing education:', error);
    return res.status(500).json({ message: 'Internal server error' });
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

    // const education = student.education.find((edu) => {
    //   return edu.educationId === educationId;
    // });

    const education = student.education.find(
      (edu) => edu._id.toString() === educationId,
    );

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

export const getAllProjects = async (req, res) => {
  const { _id } = req.user;

  try {
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      message: 'Projects fetched successfully',
      projects: student.projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
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

export const toggleSavedJob = async (req, res) => {
  const studentId = req.user._id;
  const { jobId } = req.body;

  console.log(studentId, jobId);

  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required.' });
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // FIX: Clean up invalid viewedJobs entries before proceeding
    if (student.viewedJobs && student.viewedJobs.length > 0) {
      student.viewedJobs = student.viewedJobs.filter(
        (viewedJob) =>
          viewedJob && viewedJob.job && viewedJob.job.toString().trim() !== '',
      );
    }

    // Find the index of the job in the savedJobs array
    const jobIndex = student.savedJobs.findIndex(
      (savedItem) =>
        (savedItem.job?.toString() || savedItem.toString()) === jobId,
    );

    let message;

    if (jobIndex > -1) {
      // If jobIndex is found (i.e., not -1), the job is already saved. Remove it.
      student.savedJobs.splice(jobIndex, 1);
      message = 'Job removed from saved list.';
    } else {
      // If jobIndex is -1, the job is not saved. Add it.
      student.savedJobs.push({ job: jobId });
      message = 'Job saved successfully.';
    }

    // FIX: Use updateOne instead of save to avoid validation issues
    await Student.updateOne(
      { _id: studentId },
      {
        $set: {
          savedJobs: student.savedJobs,
          viewedJobs: student.viewedJobs, // Include cleaned viewedJobs
        },
      },
    );

    // Invalidate caches in both cases (add or remove)
    await redisClient.invalidateStudentCache(studentId);
    await redisClient.del(`student:${studentId}:savedJobs`);
    await redisClient.del(`student:${studentId}:isSaved:${jobId}`);

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error toggling saved job:', error);
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
        // OPTIMIZED: Removed resumeUrl and coverLetter from select as they are not needed here.
        const student = await Student.findById(studentId).select(
          'fullName phone email jobRole profileImage jobRole education experience skills projects jobPreferences',
        );

        console.log(student);

        if (!student) throw new Error('Student not found');

        // This object now defines the 6 core categories for profile completion.
        const completionStatus = {
          coreProfile: Boolean(
            student.fullName && student.phone && student.jobRole,
          ),
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
        };

        const completedCategories =
          Object.values(completionStatus).filter(Boolean).length;
        const totalCategories = Object.keys(completionStatus).length;

        // This object is what gets returned by the API and stored in the cache.
        return {
          percentage: Math.round((completedCategories / totalCategories) * 100),
          breakdown: { completed: completedCategories, total: totalCategories },
          categories: completionStatus,
        };
      },
    );

    return res.status(200).json(completionData);
  } catch (error) {
    console.error('Error calculating profile completion:', error);
    // Avoid sending detailed error messages to the client in production
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const rand = () => Math.random().toString(36).slice(2, 8);
const makeSlug = (title) =>
  `${slugify(title || 'job', {
    lower: true,
    strict: true,
    trim: true,
  })}-${rand()}`;

function safeRegex(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

function parseMaybeDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function computeTotalExperienceYears(exps = []) {
  let ms = 0;
  const now = new Date();
  for (const e of exps) {
    const start = parseMaybeDate(e?.startDate);
    let end = parseMaybeDate(e?.endDate);
    if (!end && e?.currentlyWorking) end = now;
    if (start && end && end > start) ms += end.getTime() - start.getTime();
  }
  const years = ms / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years * 10) / 10);
}

function normalizeSet(arr = []) {
  return Array.from(
    new Set(
      arr
        .map((s) =>
          (typeof s === 'string' ? s.trim() : s?.skill || '').toLowerCase(),
        )
        .filter(Boolean),
    ),
  );
}

function scoreJob(job, profile) {
  let score = 0;
  const jobText = [
    job.title || '',
    job.description || '',
    Array.isArray(job.qualifications) ? job.qualifications.join(' ') : '',
    ...(Array.isArray(job.tags) ? job.tags : []),
  ]
    .join(' ')
    .toLowerCase();

  let skillHits = 0;
  for (const s of profile.skills) {
    if (jobText.includes(s)) skillHits++;
  }
  score += Math.min(skillHits * 5, 40);

  if (profile.titles.some((t) => new RegExp(t, 'i').test(job.title || '')))
    score += 20;

  // your schema uses experience: [String], so skip numeric comparison here

  if (profile.isRemote && job.isRemote) score += 10;

  if (
    profile.minYearly &&
    job?.salary?.min &&
    job.salary.min >= profile.minYearly
  )
    score += 10;

  return score;
}

function buildExternalQueries(titles, skills) {
  const titleQueries = titles.slice(0, 3);
  const topSkills = skills.slice(0, 3);
  const combos = [];

  for (const t of titleQueries) {
    if (topSkills.length) combos.push(`${t} ${topSkills[0]}`);
    combos.push(t);
  }
  if (!combos.length && topSkills.length) combos.push(topSkills.join(' '));

  const seen = new Set();
  return combos.filter((q) => {
    const key = q.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeByTitleCompany(jobs) {
  const seen = new Set();
  const out = [];
  for (const j of jobs) {
    const key = `${(j.title || '').toLowerCase()}|${(
      j.company || ''
    ).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}

function transformRapidApiJob(apiJob, searchQuery) {
  const qualifications = apiJob?.job_highlights?.Qualifications || [];
  const responsibilities = apiJob?.job_highlights?.Responsibilities || [];

  return {
    jobId: apiJob.job_id, // REQUIRED + UNIQUE in your schema
    origin: 'EXTERNAL',
    title: apiJob.job_title || '',
    description: apiJob.job_description || '',
    responsibilities,
    qualifications,
    company: apiJob.employer_name || '',
    country: apiJob.job_country || '',
    logo: apiJob.employer_logo || '',
    location: {
      city: apiJob.job_city || '',
      postalCode: '',
      lat: Number(apiJob.job_latitude) || undefined,
      lng: Number(apiJob.job_longitude) || undefined,
    },
    slug: makeSlug(apiJob.job_title || 'job'), // pre('save') won’t run in bulkWrite
    applyMethod: { method: 'URL', url: apiJob.job_apply_link || '' },
    isActive: true,
    jobTypes: Array.isArray(apiJob.job_employment_types)
      ? apiJob.job_employment_types
      : [],
    experience: [],
    tags: [],
    queries: searchQuery ? [searchQuery] : [],
  };
}

async function fetchExternalJobs(
  apiQuery,
  country,
  state,
  city,
  datePosted,
  employmentType,
  experience,
  page = 1,
) {
  try {
    let query = apiQuery;
    if (city && state) query = `${apiQuery} in ${city}, ${state}`;
    else if (state) query = `${apiQuery} in ${state}`;
    else if (city) query = `${apiQuery} in ${city}`;

    const params = { query, page: String(page), num_pages: '1' };
    if (country) params.country = country;
    if (state) params.state = state;
    if (city) params.city = city;
    if (datePosted) params.date_posted = datePosted;
    if (employmentType) params.employment_type = employmentType;
    if (experience) params.job_requirements = experience;

    const response = await axios.get(config.rapidJobApi, {
      params,
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
      timeout: 12000,
    });
    return response?.data?.data || [];
  } catch (e) {
    console.error(
      `RapidAPI fetch failed for "${apiQuery}" p${page}:`,
      e?.response?.data || e?.message,
    );
    return [];
  }
}

async function upsertExternalJobs(externalJobs) {
  if (!externalJobs.length) return;

  const ops = externalJobs
    .filter((j) => j.jobId)
    .map((j) => ({
      updateOne: {
        filter: { jobId: j.jobId, origin: 'EXTERNAL' },
        update: {
          $set: {
            title: j.title,
            description: j.description,
            responsibilities: j.responsibilities,
            qualifications: j.qualifications,
            company: j.company,
            country: j.country,
            logo: j.logo,
            location: j.location,
            applyMethod: j.applyMethod,
            isActive: true,
            jobTypes: j.jobTypes,
            experience: j.experience,
          },
          $addToSet: {
            tags: { $each: Array.isArray(j.tags) ? j.tags : [] },
            queries: { $each: Array.isArray(j.queries) ? j.queries : [] },
          },
          $setOnInsert: { slug: j.slug || makeSlug(j.title) },
        },
        upsert: true,
      },
    }));

  if (!ops.length) return;

  try {
    await Job.bulkWrite(ops, { ordered: false });
  } catch (e) {
    const dupesOnly =
      e?.writeErrors &&
      Array.isArray(e.writeErrors) &&
      e.writeErrors.every((w) => w?.code === 11000);
    if (!dupesOnly) throw e;
  }
}

export const getProfileBasedRecommendedJobs = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const skip = (page - 1) * limit;

    const student = await Student.findById(studentId)
      .select('fullName email jobRole skills experience jobPreferences')
      .lean();
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });

    const prefs = student.jobPreferences || {};
    const profileSkills = normalizeSet(student.skills || []);
    const titlesFromExp = normalizeSet(
      (student.experience || []).map((e) => e?.title || ''),
    );
    const titles = normalizeSet([
      student.jobRole || '',
      ...titlesFromExp,
      ...(prefs.preferredJobTitles || []),
    ]);
    const totalYears = computeTotalExperienceYears(student.experience || []);
    const minYearly = undefined; // implement convertSalaryToYearly if you want salary filtering

    // Internal/hosted filter first
    const and = [{ isActive: true }, { origin: 'HOSTED' }];
    const or = [];

    if (profileSkills.length) {
      const rx = profileSkills.slice(0, 20).map(safeRegex).filter(Boolean);
      if (rx.length) {
        and.push({
          $or: [
            { qualifications: { $in: rx } },
            { description: { $in: rx } },
            { tags: { $in: rx } },
          ],
        });
      }
    }

    if (titles.length) {
      const titleClauses = titles
        .map(safeRegex)
        .filter(Boolean)
        .map((rx) => ({ title: rx }));
      if (titleClauses.length) or.push(...titleClauses);
    }

    if (prefs.isRemote === true) {
      // no isRemote in your schema; skipping
    } else {
      const countryRx = (prefs.preferredCountries || [])
        .map(safeRegex)
        .filter(Boolean);
      if (countryRx.length) and.push({ country: { $in: countryRx } });

      const cityRx = (prefs.preferredCities || [])
        .map(safeRegex)
        .filter(Boolean);
      if (cityRx.length) and.push({ 'location.city': { $in: cityRx } });
    }

    if (
      Array.isArray(prefs.preferredJobTypes) &&
      prefs.preferredJobTypes.length
    ) {
      and.push({ jobTypes: { $in: prefs.preferredJobTypes } });
    }

    if (
      Array.isArray(prefs.preferredIndustries) &&
      prefs.preferredIndustries.length
    ) {
      const indRx = prefs.preferredIndustries.map(safeRegex).filter(Boolean);
      if (indRx.length) and.push({ tags: { $in: indRx } });
    }

    const filter = and.length ? { $and: and } : {};
    if (or.length) {
      if (!filter.$and) filter.$and = [];
      filter.$and.push({ $or: or });
    }

    // 1) Try internal/hosted first
    const [internalJobs, internalTotal] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    if (internalTotal > 0) {
      const profileCtx = {
        skills: profileSkills,
        titles,
        totalYears,
        isRemote: !!prefs.isRemote,
        minYearly,
      };
      const scored = internalJobs
        .map((j) => ({ ...j, matchScore: scoreJob(j, profileCtx) }))
        .sort((a, b) => b.matchScore - a.matchScore);

      return res.status(200).json({
        success: true,
        jobs: scored,
        pagination: {
          total: internalTotal,
          page,
          limit,
          totalPages: Math.ceil(internalTotal / limit),
        },
        profileSummary: {
          titles,
          skills: profileSkills,
          totalYears,
          minYearly,
        },
        source: 'internal',
      });
    }

    // 2) Fallback to RapidAPI, PERSIST, then return from DB
    const queries = buildExternalQueries(titles, profileSkills);
    const locCountry =
      Array.isArray(prefs.preferredCountries) && prefs.preferredCountries[0]
        ? prefs.preferredCountries[0]
        : undefined;
    const locCity =
      Array.isArray(prefs.preferredCities) && prefs.preferredCities[0]
        ? prefs.preferredCities[0]
        : undefined;

    const PAGES_PER_QUERY = 2; // tune to avoid throttling
    const externalTransformed = [];

    for (const q of queries) {
      for (let p = 1; p <= PAGES_PER_QUERY; p++) {
        const data = await fetchExternalJobs(
          q,
          locCountry,
          undefined,
          locCity,
          undefined,
          Array.isArray(prefs.preferredJobTypes) && prefs.preferredJobTypes[0]
            ? prefs.preferredJobTypes[0]
            : undefined,
          undefined,
          p,
        );
        for (const raw of data)
          externalTransformed.push(transformRapidApiJob(raw, q));
      }
    }

    let externalJobs = externalTransformed;
    if (!externalJobs.length) {
      return res.status(200).json({
        success: true,
        jobs: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
        profileSummary: {
          titles,
          skills: profileSkills,
          totalYears,
          minYearly,
        },
        source: 'external',
        note: 'No matches from RapidAPI.',
      });
    }

    externalJobs = dedupeByTitleCompany(externalJobs);

    // Persist idempotently by jobId + origin
    await upsertExternalJobs(externalJobs);

    // Re-query saved docs so the UI gets consistent shape + _id
    const ids = externalJobs.map((j) => j.jobId).filter(Boolean);
    const saved = await Job.find({ origin: 'EXTERNAL', jobId: { $in: ids } })
      .sort({ createdAt: -1 })
      .lean();

    const profileCtx = {
      skills: profileSkills,
      titles,
      totalYears,
      isRemote: !!prefs.isRemote,
      minYearly,
    };
    const scored = saved
      .map((j) => ({ ...j, matchScore: scoreJob(j, profileCtx) }))
      .sort((a, b) => b.matchScore - a.matchScore);

    const total = scored.length;
    const paged = scored.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      jobs: paged,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      profileSummary: { titles, skills: profileSkills, totalYears, minYearly },
      source: 'external-persisted',
    });
  } catch (error) {
    console.error(
      'Error fetching profile-based recommended jobs (persisted):',
      error,
    );
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message || String(error),
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

export const jobViewedByStudent = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { jobId } = req.params;

    // console.log( jobId);

    // Check if the student has already viewed this specific job
    const student = await Student.findOne({
      _id: studentId,
      'viewedJobs.slug': jobId,
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
        viewedJobs: { slug: jobId },
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
        select: 'title company salary location jobTypes slug', // Specify which job fields to return
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
        select: 'title company salary location jobTypes slug', // Specify which job fields to return
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
        select: 'title company salary location jobTypes slug', // Specify which job fields to return
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
