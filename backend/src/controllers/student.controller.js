import slugify from 'slugify';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import { User } from '../models/User.model.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { safeUnlink, __dirname } from '../utils/fileUploadingManaging.js';

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

export const updateStudentSkills = async (req, res) => {
  const { skillId } = req.params;
  const { level } = req.body;
  const { _id } = req.user;

  console.log(skillId, level);
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
