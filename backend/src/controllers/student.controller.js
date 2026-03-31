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
import { generatePdfFromHtml } from '../utils/generatePdfFromHtml.js';
import redisClient from '../config/redis.js';
import {
  normalizeSet,
  transformRapidApiJob,
  retrieveLocalCandidates,
  buildInteractionContext,
  applyFilters,
  fetchExternalJobs,
  upsertExternalJobs,
  rankJobs,
  diversify,
  dedupeByTitleCompany,
  rankJobsWithIntentBoost,
  fetchExternalDeep,
  attachJobViews,
} from '../utils/jobHelpers.js';
import {
  addCredits,
  CREDIT_EARN,
  earnCreditsForAction,
} from '../utils/credits.js';
import { generateEmbedding } from '../config/embedding.js';
import { getCachedReco, makeRecoKey } from '../utils/recoCache.js';
import {
  getPrefetchedJobs,
  setPrefetchedJobs,
} from '../utils/prefetchCache.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { makeTop4Key } from '../utils/dashboardKeys.js';

const PROFILE_SECTION_ACTIONS = {
  PERSONAL: 'PROFILE_COMPLETE_PERSONAL',
  EDUCATION: 'PROFILE_COMPLETE_EDUCATION',
  EXPERIENCE: 'PROFILE_COMPLETE_EXPERIENCE',
  PROJECT: 'PROFILE_COMPLETE_PROJECT',
  SKILL: 'PROFILE_COMPLETE_SKILL',
};

// ------Contants ------

const STUDENT_TTL = 300;
const SKILLS_CACHE_KEY = (userId) => `student:${userId}:skills`;

const EXPERIENCE_TTL = 300; // seconds (5 minutes)
const EXPERIENCE_CACHE_KEY = (userId) => `student:${userId}:experience`;

const EDUCATION_TTL = 300; // seconds (5 minutes)
const EDUCATION_CACHE_KEY = (userId) => `student:${userId}:education`;

const PROJECTS_TTL = 300; // 5 minutes
const PROJECTS_CACHE_KEY = (userId) => `student:${userId}:projects`;

const ALLOWED_SOCIAL_ACTIONS = new Set([
  'FOLLOW_LINKEDIN',
  'FOLLOW_INSTAGRAM',
  'FOLLOW_FACEBOOK',
  'FOLLOW_YOUTUBE',
  'FOLLOW_TIKTOK',
  'SHARE_SOCIAL_CONTENT',
  'LIKE_COMMENT_SHARE',
]);

// ------Helper funtion------
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

function computeProfileCompletion(student) {
  const hasPersonal = !!student.fullName && !!student.email && !!student.phone; // add profileImage/jobRole if you want stricter

  const hasEducation =
    Array.isArray(student.education) && student.education.length > 0;

  const hasExperience =
    Array.isArray(student.experience) && student.experience.length > 0;

  const hasProjects =
    Array.isArray(student.projects) && student.projects.length > 0;

  const hasSkills = Array.isArray(student.skills) && student.skills.length > 0;

  return {
    PERSONAL: hasPersonal,
    EDUCATION: hasEducation,
    EXPERIENCE: hasExperience,
    PROJECT: hasProjects,
    SKILL: hasSkills,
  };
}

export async function claimProfileCompletionCreditsForUser(userId) {
  // use Student profile to measure completion
  const student = await Student.findById(userId).lean();
  if (!student) {
    const err = new Error('Student not found for profile completion check');
    err.status = 404;
    throw err;
  }

  const completion = computeProfileCompletion(student);

  const actionsToTry = [];
  if (completion.PERSONAL) actionsToTry.push(PROFILE_SECTION_ACTIONS.PERSONAL);
  if (completion.EDUCATION)
    actionsToTry.push(PROFILE_SECTION_ACTIONS.EDUCATION);
  if (completion.EXPERIENCE)
    actionsToTry.push(PROFILE_SECTION_ACTIONS.EXPERIENCE);
  if (completion.PROJECT) actionsToTry.push(PROFILE_SECTION_ACTIONS.PROJECT);
  if (completion.SKILL) actionsToTry.push(PROFILE_SECTION_ACTIONS.SKILL);

  const result = {
    claimed: [], // { action, amount, balance }
    skipped: [], // { action, reason }
  };

  for (const action of actionsToTry) {
    try {
      const { tx, balance } = await earnCreditsForAction(userId, action, {});
      result.claimed.push({
        action,
        amount: tx.amount,
        balance,
      });
    } catch (err) {
      // 409 from earnCreditsForAction = already claimed / not allowed now
      if (err && err.status === 409) {
        result.skipped.push({ action, reason: 'already_claimed' });
      } else {
        console.error('Failed to award credits for', action, err);
        result.skipped.push({ action, reason: 'error' });
      }
    }
  }

  return {
    completion,
    ...result,
  };
}

export async function buildUserProfileFromStudent(userId) {
  const student = await Student.findById(userId)
    .select('location jobRole jobPreferences')
    .lean();
  let skills = await StudentSkill.find({ student: userId }).lean();

  if (!student) {
    return {
      skills: [],
      titles: [],
      jobPreferences: {},
      isRemote: false,
      minYearly: 0,
      location: null,
      appliedJobs: [],
    };
  }

  // Skills
  const skillsRaw = [
    ...(skills || []).map((s) => s.skill),
    ...(student.jobPreferences?.mustHaveSkills || []).map((s) => s.skill),
    ...(student.jobPreferences?.niceToHaveSkills || []).map((s) => s.skill),
  ];

  skills = normalizeSet(skillsRaw);

  // Titles
  const titlesRaw = [
    student.jobRole,
    ...(student.jobPreferences?.preferredJobTitles || []),
  ].filter(Boolean);

  const titles = normalizeSet(titlesRaw);

  // Location normalization
  let location = null;
  if (typeof student.location === 'string') {
    location = { city: student.location.toUpperCase() };
  } else if (student.location && typeof student.location === 'object') {
    location = student.location;
  }

  const jobPreferences = student.jobPreferences || {};

  const isRemote =
    jobPreferences.isRemote === true || student.isRemote === true || false;

  const minYearly =
    jobPreferences?.preferredSalary?.min || student.expectedSalaryYearly || 0;

  const appliedJobs = Array.isArray(student.appliedJobs)
    ? student.appliedJobs
    : [];

  return {
    skills,
    titles,
    jobPreferences,
    isRemote,
    minYearly,
    location,
    appliedJobs,
  };
}

// --------Controllers--------

export const studentDetails = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = `student:${_id}:details`;
  const TTL_SECONDS = 300; // 5 minutes

  try {
    // try cache first so we can report fromCache accurately
    const cachedRaw = await redisClient.get(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      return res.status(200).json({
        studentDetails: cached,
        fromCache: true,
      });
    }

    // cache miss -> use withCache (it will set cache)
    const student = await redisClient.withCache(
      cacheKey,
      TTL_SECONDS,
      async () => {
        const s = await Student.findById(_id).select('-__v').lean();

        if (s) return s;

        const user = await User.findById(_id).lean();
        if (!user) throw { status: 404, message: 'User not found' };
        if (user.role !== 'user') {
          throw {
            status: 403,
            message: 'Only students can create student profile',
          };
        }

        const created = await Student.create({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        });

        return created.toObject();
      },
    );

    return res.status(200).json({
      studentDetails: student,
      fromCache: false,
    });
  } catch (error) {
    console.error('Error creating/fetching student details:', error);
    if (error && error.status)
      return res.status(error.status).json({ message: error.message });
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate data error. Please try again.',
        error: 'Duplicate key violation',
      });
    }
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message || error,
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

    const cacheKey = `student:${studentId}:details`;
    try {
      await redisClient.invalidateStudentCache(studentId);
      // set canonical key for quick reads
      await redisClient.set(cacheKey, JSON.stringify(student.toObject()), 300); // 5min
    } catch (cacheErr) {
      console.warn(
        'Cache update failed after onboardingProfile:',
        cacheErr && cacheErr.message,
      );
    }

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

    const updated = await Student.findByIdAndUpdate(
      studentId,
      { hasCompletedOnboarding: true },
      { new: true, runValidators: true },
    );

    // Clear relevant user cache keys
    try {
      await redisClient.invalidateStudentCache(studentId);
      // optionally set canonical details to up-to-date value if updated exists
      if (updated) {
        await redisClient.set(
          `student:${studentId}:details`,
          JSON.stringify(updated.toObject()),
          300,
        );
      }
    } catch (cacheErr) {
      console.warn(
        'Failed clearing student cache on completeOnboarding:',
        cacheErr && cacheErr.message,
      );
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding status updated successfully.',
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStudentProfile = async (req, res) => {
  const { _id } = req.user;
  // Destructure all possible fields that are allowed to be updated
  const { fullName, phone, email, location, jobPreference: jobRole } = req.body;

  try {
    const update = {};
    if (fullName !== undefined) update.fullName = fullName;
    if (phone !== undefined) update.phone = phone;
    if (email !== undefined) update.email = email;
    if (location !== undefined) update.location = location;
    if (jobRole !== undefined) update.jobRole = jobRole;

    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid fields provided to update' });
    }

    update.updatedAt = new Date();

    const result = await Student.findByIdAndUpdate(
      _id,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!result) {
      return res.status(404).json({ message: 'Student not found' });
    }

    try {
      const cacheKey = `student:${_id}:details`;
      await redisClient.del(cacheKey); // Remove stale data
      await redisClient.set(cacheKey, JSON.stringify(result.toObject()), 300);
    } catch (cacheErr) {
      console.warn(
        'Failed to update student cache in updateStudentProfile:',
        cacheErr && cacheErr.message,
      );
    }

    // 5. Return success response
    return res.status(200).json({
      message: 'Profile updated successfully',
      updatedStudent: {
        fullName: result.fullName,
        email: result.email,
        phone: result.phone,
        location: result.location,
        jobRole: result.jobRole,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    // Handle Mongoose CastError (invalid ID)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // Handle specific validation errors (e.g., duplicate email)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateFullName = async (req, res) => {
  const { fullName, phone, email } = req.body;
  const { _id } = req.user;

  try {
    const update = {};
    if (fullName) update.fullName = fullName;
    if (phone) update.phone = phone;
    if (email) update.email = email;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }
    update.updatedAt = new Date();

    const result = await Student.findByIdAndUpdate(
      _id,
      { $set: update },
      { new: true },
    );
    if (!result) return res.status(404).json({ message: 'Student not found' });

    // update canonical cache ONLY for this student
    try {
      const cacheKey = `student:${_id}:details`;
      await redisClient.del(cacheKey); // ensure stale gone
      await redisClient.set(cacheKey, JSON.stringify(result.toObject()), 300);
    } catch (cacheErr) {
      console.warn(
        'Failed to update student cache in updateFullName:',
        cacheErr && cacheErr.message,
      );
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      updatedStudent: {
        fullName: result.fullName,
        phone: result.phone,
        email: result.email,
      },
    });
  } catch (error) {
    console.error('Error updating full name:', error);
    if (error.name === 'CastError')
      return res.status(400).json({ message: 'Invalid student ID format' });
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateLocation = async (req, res) => {
  const { location } = req.body;
  const { _id } = req.user;
  try {
    const result = await Student.findByIdAndUpdate(
      _id,
      { $set: { location, updatedAt: new Date() } },
      { new: true },
    );
    if (!result) return res.status(404).json({ message: 'Student not found' });

    try {
      const cacheKey = `student:${_id}:details`;
      await redisClient.del(cacheKey);
      await redisClient.set(cacheKey, JSON.stringify(result.toObject()), 300);
    } catch (cacheErr) {
      console.warn(
        'Failed to update student cache in updateLocation:',
        cacheErr && cacheErr.message,
      );
    }

    return res.status(200).json({
      message: 'Location updated successfully',
      updatedStudent: {
        location: result.location,
      },
    });
  } catch (error) {
    console.error('Error updating location:', error);
    if (error.name === 'CastError')
      return res.status(400).json({ message: 'Invalid student ID format' });
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updatePhone = async (req, res) => {
  const { phone } = req.body;
  const { _id } = req.user;
  try {
    const result = await Student.findByIdAndUpdate(
      _id,
      { $set: { phone, updatedAt: new Date() } },
      { new: true },
    );
    if (!result) return res.status(404).json({ message: 'Student not found' });

    try {
      const cacheKey = `student:${_id}:details`;
      await redisClient.del(cacheKey);
      await redisClient.set(cacheKey, JSON.stringify(result.toObject()), 300);
    } catch (cacheErr) {
      console.warn(
        'Failed to update student cache in updatePhone:',
        cacheErr && cacheErr.message,
      );
    }

    res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateJobRole = async (req, res) => {
  const { jobRole } = req.body;
  const { _id } = req.user;

  try {
    const result = await Student.findByIdAndUpdate(
      _id,
      { $set: { jobRole, updatedAt: new Date() } },
      { new: true },
    );
    if (!result) return res.status(404).json({ message: 'Student not found' });

    try {
      const cacheKey = `student:${_id}:details`;
      await redisClient.del(cacheKey);
      await redisClient.set(cacheKey, JSON.stringify(result.toObject()), 300);
    } catch (cacheErr) {
      console.warn(
        'Failed to update student cache in updateJobRole:',
        cacheErr && cacheErr.message,
      );
    }

    res.status(200).json({ message: 'Job role updated successfully' });
  } catch (error) {
    console.error('Error updating job role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentSkills = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = SKILLS_CACHE_KEY(_id);

  try {
    const skills = await redisClient.withCache(
      cacheKey,
      STUDENT_TTL,
      async () => {
        const student = await Student.findById(_id)
          .select('skills -_id')
          .lean();
        if (!student) {
          // do not cache a not-found user; throw to let caller handle
          throw { status: 404, message: 'Student not found' };
        }
        // return the skills array (could be empty)
        return student.skills || [];
      },
    );

    return res.status(200).json({ skills, fromCache: false });
  } catch (err) {
    console.error('Error fetching skills:', err);
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

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
      { new: true, select: 'skills' },
    ).lean();

    if (!result) {
      return res.status(404).json({ message: 'Student not found' });
    }

    try {
      await claimProfileCompletionCreditsForUser(_id);
    } catch (e) {
      console.warn(
        'Failed to auto-claim profile credits after education add:',
        e?.message,
      );
    }

    // Invalidate cache for skills/details
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
    const isObjectId = mongoose.Types.ObjectId.isValid(skillId);

    let updated;
    if (isObjectId) {
      const objectId = new mongoose.Types.ObjectId(skillId); // <-- use new
      updated = await Student.findByIdAndUpdate(
        _id,
        { $pull: { skills: { _id: objectId } } },
        { new: true, select: 'skills' },
      ).lean();
    } else {
      updated = await Student.findByIdAndUpdate(
        _id,
        { $pull: { skills: { skillId } } },
        { new: true, select: 'skills' },
      ).lean();
    }

    if (!updated) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Skill removed successfully',
      skills: updated.skills || [],
    });
  } catch (error) {
    console.error('Error removing skill:', error);
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

  if (!skillId) {
    return res.status(400).json({ message: 'Skill ID is required' });
  }
  if (!level) {
    return res.status(400).json({ message: 'New level is required' });
  }

  try {
    // Find the student
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find skill by the skillId property (string slug)
    const skill = student.skills.find((s) => String(s._id) === String(skillId));
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    skill.level = level;
    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res
      .status(200)
      .json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    console.error('Error updating skills:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getExperience = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = EXPERIENCE_CACHE_KEY(_id);

  try {
    const experience = await redisClient.withCache(
      cacheKey,
      EXPERIENCE_TTL,
      async () => {
        const student = await Student.findById(_id)
          .select('experience -_id')
          .lean();
        if (!student) throw { status: 404, message: 'Student not found' };
        return student.experience || [];
      },
    );

    return res.status(200).json({ experience, fromCache: false });
  } catch (err) {
    console.error('Error fetching experience:', err);
    if (err && err.status)
      return res.status(err.status).json({ message: err.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addExperience = async (req, res) => {
  const {
    company,
    designation,
    startDate,
    endDate,
    responsibilities,
    currentlyWorking,
    location,
  } = req.body;

  const { _id } = req.user;

  if (!company || !designation || !startDate) {
    return res
      .status(400)
      .json({ message: 'company, title and startDate are required' });
  }

  try {
    const student = await Student.findById(_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const experienceId = slugify(`${company}-${designation}`, { lower: true });

    if (student.experience.find((exp) => exp.experienceId === experienceId)) {
      return res.status(400).json({ message: 'Experience already exists' });
    }

    const experienceYrs = calculateExperience(
      startDate,
      endDate,
      currentlyWorking,
    );

    const newExp = {
      experienceId,
      company,
      designation,
      startDate,
      endDate,
      responsibilities,
      currentlyWorking,
      experienceYrs,
      location,
    };

    student.experience.push(newExp);
    await student.save();

    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Experience added successfully',
      experience: student.experience,
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeExperience = async (req, res) => {
  const { expId } = req.params;
  const { _id } = req.user;

  if (!expId)
    return res.status(400).json({ message: 'Experience id is required' });

  try {
    const student = await Student.findById(_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Determine whether expId is an ObjectId or your slug (experienceId)
    const isObjectId = mongoose.Types.ObjectId.isValid(expId);

    const beforeCount = student.experience.length;

    student.experience = student.experience.filter((exp) => {
      if (isObjectId) return exp._id.toString() !== expId;
      return exp.experienceId !== expId;
    });

    if (student.experience.length === beforeCount) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Experience removed successfully',
      experience: student.experience,
    });
  } catch (error) {
    console.error('Error removing experience:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateExperience = async (req, res) => {
  const { expId } = req.params;
  const {
    company,
    designation: title,
    employmentType,
    designation: jobType,
    startDate,
    endDate,
    responsibilities: description,
    location,
    currentlyWorking,
  } = req.body;
  const { _id } = req.user;

  if (!expId)
    return res.status(400).json({ message: 'Experience id is required' });

  try {
    const student = await Student.findById(_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isObjectId = mongoose.Types.ObjectId.isValid(expId);

    const experience = student.experience.find((exp) => {
      if (isObjectId) return exp._id.toString() === expId;
      return exp.experienceId === expId;
    });

    if (!experience)
      return res.status(404).json({ message: 'Experience not found' });

    // Update only provided fields (avoid clobbering)
    if (company !== undefined) experience.company = company;
    if (title !== undefined) experience.title = title;
    if (startDate !== undefined) experience.startDate = startDate;
    if (endDate !== undefined) experience.endDate = endDate;
    if (description !== undefined) experience.description = description;
    if (location !== undefined) experience.location = location;
    if (jobType !== undefined) experience.designation = jobType;
    if (employmentType !== undefined)
      experience.employmentType = employmentType;
    if (currentlyWorking !== undefined)
      experience.currentlyWorking = currentlyWorking;

    // Recalculate experience years if dates or currentlyWorking changed
    experience.experienceYrs = calculateExperience(
      experience.startDate,
      experience.endDate,
      experience.currentlyWorking,
    );

    // If you accept changing company/title, you might want to regenerate experienceId — left unchanged on purpose.
    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res
      .status(200)
      .json({ message: 'Experience updated successfully', experience });
  } catch (error) {
    console.error('Error updating experience:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEducationsById = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = EDUCATION_CACHE_KEY(_id);

  try {
    const educations = await redisClient.withCache(
      cacheKey,
      EDUCATION_TTL,
      async () => {
        const student = await Student.findById(_id)
          .select('education -_id')
          .lean();
        if (!student) throw { status: 404, message: 'Student not found' };
        return student.education || [];
      },
    );

    return res.status(200).json({ educations, fromCache: false });
  } catch (error) {
    console.error('Error getting educations:', error);
    if (error && error.status)
      return res.status(error.status).json({ message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
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

  if (!degree || !fieldOfStudy) {
    return res
      .status(400)
      .json({ message: 'degree and fieldOfStudy are required' });
  }

  try {
    const student = await Student.findById(_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const educationId = slugify(`${degree}-${fieldOfStudy}`, { lower: true });

    if (student.education.find((edu) => edu.educationId === educationId)) {
      return res.status(400).json({ message: 'Education already exists' });
    }

    const newEdu = {
      educationId,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      institute,
      country,
      isCurrentlyStudying,
    };

    student.education.push(newEdu);
    await student.save();

    // Invalidate cache so next read repopulates fresh data
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Education added successfully',
      education: student.education,
    });
  } catch (error) {
    console.error('Error adding education:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!eduId)
      return res.status(400).json({ message: 'Education id is required' });

    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Try to remove by subdocument ObjectId first
    let removed = null;
    if (mongoose.Types.ObjectId.isValid(eduId)) {
      const subdoc = student.education.id(eduId);
      if (subdoc) {
        removed = subdoc.toObject();
        subdoc.deleteOne();
      }
    }

    // If not removed by ObjectId, try by slug field `educationId`
    if (!removed) {
      const beforeLen = student.education.length;
      student.education = student.education.filter(
        (edu) => edu.educationId !== eduId,
      );
      if (student.education.length < beforeLen) {
        removed = { educationId: eduId };
      }
    }

    if (!removed) {
      return res.status(404).json({ message: 'Education not found' });
    }

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(userId);

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

  if (!educationId)
    return res.status(400).json({ message: 'Education id is required' });

  try {
    const student = await Student.findById(_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isObjectId = mongoose.Types.ObjectId.isValid(educationId);
    const education = student.education.find((edu) =>
      isObjectId
        ? edu._id.toString() === educationId
        : edu.educationId === educationId,
    );

    if (!education)
      return res.status(404).json({ message: 'Education not found' });

    // Update only provided fields
    if (degree !== undefined) education.degree = degree;
    if (fieldOfStudy !== undefined) education.fieldOfStudy = fieldOfStudy;
    if (startDate !== undefined) education.startDate = startDate;
    if (endDate !== undefined) education.endDate = endDate;
    if (grade !== undefined) education.grade = grade;
    if (institute !== undefined) education.institute = institute;
    if (country !== undefined) education.country = country;
    if (isCurrentlyStudying !== undefined)
      education.isCurrentlyStudying = isCurrentlyStudying;
    if (isCurrentlyStudying === false) education.endDate = null;

    await student.save();

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res
      .status(200)
      .json({ message: 'Education updated successfully', education });
  } catch (error) {
    console.error('Error updating education:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllProjects = async (req, res) => {
  const { _id } = req.user;
  const cacheKey = PROJECTS_CACHE_KEY(_id);

  try {
    const projects = await redisClient.withCache(
      cacheKey,
      PROJECTS_TTL,
      async () => {
        const student = await Student.findById(_id)
          .select('projects -_id')
          .lean();
        if (!student) throw { status: 404, message: 'Student not found' };
        return student.projects || [];
      },
    );

    return res.status(200).json({
      message: 'Projects fetched successfully',
      projects,
      fromCache: false,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (error && error.status)
      return res.status(error.status).json({ message: error.message });
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
  const { _id } = req.user;

  if (!projectName) {
    return res.status(400).json({ message: 'projectName is required' });
  }

  try {
    const student = await Student.findById(_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

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

    // Invalidate cache so next read repopulates
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Project added successfully',
      projects: student.projects,
    });
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
    // use positional operator to atomically update array element
    const setOps = {};
    if (projectName !== undefined)
      setOps['projects.$.projectName'] = projectName;
    if (description !== undefined)
      setOps['projects.$.description'] = description;
    if (startDate !== undefined) setOps['projects.$.startDate'] = startDate;
    if (endDate !== undefined) setOps['projects.$.endDate'] = endDate;
    if (technologies !== undefined)
      setOps['projects.$.technologies'] = technologies;
    if (link !== undefined) setOps['projects.$.link'] = link;
    if (isWorkingActive !== undefined)
      setOps['projects.$.isWorkingActive'] = isWorkingActive;
    setOps['projects.$.updatedAt'] = new Date();

    const result = await Student.findOneAndUpdate(
      {
        _id,
        'projects._id': projectId,
      },
      { $set: setOps },
      { new: true, select: 'projects' },
    ).lean();

    if (!result) {
      return res.status(404).json({ message: 'Student or project not found' });
    }

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    const updatedProject = result.projects.find(
      (p) => p._id.toString() === projectId,
    );
    return res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeProject = async (req, res) => {
  const { projectId } = req.params;
  const { _id } = req.user;

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  // allow either slug or ObjectId — prefer ObjectId removal if valid
  const isObjectId = mongoose.Types.ObjectId.isValid(projectId);

  try {
    let updatedStudent = null;

    if (isObjectId) {
      updatedStudent = await Student.findByIdAndUpdate(
        _id,
        { $pull: { projects: { _id: projectId } } },
        { new: true, select: 'projects' },
      ).lean();
    }

    // If not found/removed and projectId is not ObjectId, try removing by a `projectId` slug field
    if (!updatedStudent) {
      updatedStudent = await Student.findByIdAndUpdate(
        _id,
        { $pull: { projects: { projectId } } },
        { new: true, select: 'projects' },
      ).lean();
    }

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ message: 'Student not found or project not present' });
    }

    // Invalidate cache
    await redisClient.invalidateStudentCache(_id);

    return res.status(200).json({
      message: 'Project removed successfully',
      remainingProjects: updatedStudent.projects,
    });
  } catch (error) {
    console.error('Error removing project:', error);
    return res.status(500).json({ message: 'Internal server error' });
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

  try {
    // Fetch both student and user data in parallel
    const [student, studentReferral] = await Promise.all([
      Student.findById(
        _id,
        'visitedJobs appliedJobs viewedJobs savedJobs cls cvs tailoredApplications ',
      ),
      User.findById(_id, 'referralCount referralCode isEmailVerified'),
    ]);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const analytics = {
      applicationsSent: student.appliedJobs?.length || 0,
      jobsVisited: student.visitedJobs?.length || 0,
      jobsViewed: student.viewedJobs?.length || 0,
      savedJobsCount: student.savedJobs?.length || 0,
      appliedJobsCount: student.appliedJobs?.length || 0,
      cvsGenerated: student.cvs?.length || 0,
      coverLettersGenerated: student.cls?.length || 0,
      tailoredApplications: student.tailoredApplications?.length || 0,
      referralCount: studentReferral?.referralCount || 0,
      isEmailVerified: studentReferral?.isEmailVerified || false,
      referralCode: studentReferral?.referralCode || '',
    };

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
              .filter((item) => item && item.skill);
          } else {
            update[`jobPreferences.${key}`] = [];
          }
        } else if (formData[key] !== undefined) {
          update[`jobPreferences.${key}`] = formData[key];
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid job preference data provided to update.' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 🔥 FIX: Explicitly delete the exact key used in getProfileCompletion
    const profileCacheKey = `student:${studentId}:profileCompletion`;

    try {
      if (redisClient.del) {
        await redisClient.del(profileCacheKey);
      } else if (redisClient.invalidate) {
        await redisClient.invalidate(profileCacheKey);
      }

      // Keep your existing generic invalidation too
      redisClient
        .invalidateStudentCache(studentId)
        .catch((err) =>
          console.error('Error invalidating generic student cache:', err),
        );
    } catch (cacheErr) {
      console.error('Manual cache clear failed:', cacheErr);
    }

    return res.status(200).json({
      message: 'Job preferences updated successfully',
      preferences: student.jobPreferences,
    });
  } catch (error) {
    console.error('Error updating job preferences:', error);
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
        const student =
          await Student.findById(studentId).select('jobPreferences');
        return student?.jobPreferences || {};
      },
    );

    return res.status(200).json({ preferences });
  } catch (error) {
    console.error('Error getting preferences:', error);
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
            student.jobPreferences?.preferredJobTitles?.length > 0 &&
            student.jobPreferences?.preferredSalary?.min > 0 &&
            (student.jobPreferences?.preferredCountries?.length > 0 ||
              student.jobPreferences?.preferredCities?.length > 0 ||
              student.jobPreferences?.isRemote === true),
          ),
        };

        const completedCategories =
          Object.values(completionStatus).filter(Boolean).length;
        const totalCategories = Object.keys(completionStatus).length;

        // award credits once per true status
        if (completionStatus.coreProfile) {
          try {
            await earnCreditsForAction(studentId, 'PROFILE_COMPLETE_PERSONAL');
          } catch (err) {
            if (!err.status || err.status !== 409) throw err;
          }
        }
        if (completionStatus.education) {
          try {
            await earnCreditsForAction(studentId, 'PROFILE_COMPLETE_EDUCATION');
          } catch (err) {
            if (!err.status || err.status !== 409) throw err;
          }
        }
        if (completionStatus.workExperience) {
          try {
            await earnCreditsForAction(
              studentId,
              'PROFILE_COMPLETE_EXPERIENCE',
            );
          } catch (err) {
            if (!err.status || err.status !== 409) throw err;
          }
        }
        if (completionStatus.skills) {
          try {
            await earnCreditsForAction(studentId, 'PROFILE_COMPLETE_SKILL');
          } catch (err) {
            if (!err.status || err.status !== 409) throw err;
          }
        }
        if (completionStatus.projects) {
          try {
            await earnCreditsForAction(studentId, 'PROFILE_COMPLETE_PROJECT');
          } catch (err) {
            if (!err.status || err.status !== 409) throw err;
          }
        }
        if (completionStatus.jobPreferences) {
          try {
            await earnCreditsForAction(
              studentId,
              'PROFILE_COMPLETE_JOB_PREFERENCES',
            );
          } catch (err) {
            if (!err.status || err.status !== 409) throw err;
          }
        }

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
// ===== PROMPT LOGGING SETUP =====
const PROMPT_LOG_DIR = path.resolve(process.cwd(), 'logs');
const PROMPT_LOG_FILE = path.join(PROMPT_LOG_DIR, 'profile.txt');

function logPromptToFile(profile, meta = {}) {
  try {
    if (!fs.existsSync(PROMPT_LOG_DIR)) {
      fs.mkdirSync(PROMPT_LOG_DIR, { recursive: true });
    }

    const entry = `
==============================
TIMESTAMP: ${new Date().toISOString()}
==============================
${JSON.stringify(profile)}

`;

    fs.appendFile(PROMPT_LOG_FILE, entry, () => {});
  } catch {
    // alralkjsfd
  }
}

const syncCooldown = new Map();
const RECO_SYNC_COOLDOWN_MS = 5 * 60 * 1000;
const RECO_FAST_LOCAL_POOL = 800;
const RECO_CACHE_MAX_JOBS = 120;

export async function getProfileBasedRecommendedJobs(req, res) {
  const { page = 1, limit = 10 } = req.query || {};
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    // Return prefetched jobs instantly when available (page 1, limit ≤ 10)
    if (pageNum === 1 && limitNum <= 10) {
      const prefetched = await getPrefetchedJobs(req.user._id);
      if (prefetched?.jobs?.length) {
        return res.status(200).json({
          success: true,
          pagination: prefetched.pagination,
          jobs: prefetched.jobs,
        });
      }
    }

    const profile = await buildUserProfileFromStudent(req.user._id);
    profile._id = req.user._id;
    const recoCacheKey = `${makeRecoKey(profile)}:feed`;

    const cachedRecoRaw = await redisClient.get(recoCacheKey);
    if (cachedRecoRaw) {
      try {
        const cachedReco = JSON.parse(cachedRecoRaw);
        const cachedJobs = Array.isArray(cachedReco?.jobs) ? cachedReco.jobs : [];
        const cachedSlice = cachedJobs.slice(skip, skip + limitNum);

        if (cachedSlice.length > 0 || (skip === 0 && cachedJobs.length > 0)) {
          const jobsWithViews = await attachJobViews(cachedSlice);

          const syncKey = `${req.user._id}:${pageNum}:${limitNum}`;
          const lastSyncAt = syncCooldown.get(syncKey) || 0;
          if (Date.now() - lastSyncAt > RECO_SYNC_COOLDOWN_MS) {
            syncCooldown.set(syncKey, Date.now());
            setImmediate(async () => {
              try {
                const bgProfile = await buildUserProfileFromStudent(req.user._id);
                bgProfile._id = req.user._id;
                const bgInteractions = await buildInteractionContext(req.user._id);
                const bgPrimaryTitles = normalizeSet(bgProfile.titles || []);
                const bgPrimaryIntent =
                  bgPrimaryTitles.join(' ').trim() || 'jobs';
                const bgCountry = bgProfile.location?.country || 'IN';
                const bgState = bgProfile.location?.state;
                const bgCity = bgProfile.location?.city;

                const makeContext = (filterOverride) => ({
                  type: 'recommendation',
                  query: bgPrimaryIntent,
                  vectorQuery: `${bgPrimaryIntent} ${normalizeSet(
                    bgProfile.skills || [],
                  )
                    .slice(0, 5)
                    .join(' ')}`.trim(),
                  profile: bgProfile,
                  filters: filterOverride,
                  userId: req.user._id,
                  interactions: bgInteractions,
                });

                const processPool = (jobsPool, ctx) => {
                  const validJobs = jobsPool.filter(
                    (job) => job.description && job.description.trim().length > 0,
                  );
                  const filtered = applyFilters(validJobs, ctx);
                  return rankJobsWithIntentBoost(filtered, ctx);
                };

                const levels = [
                  ...(bgCity ? [{ country: bgCountry, state: bgState, city: bgCity }] : []),
                  ...(bgState ? [{ country: bgCountry, state: bgState, city: null }] : []),
                  { country: bgCountry, state: null, city: null },
                  { country: null, state: null, city: null },
                ];

                let processed = [];

                for (const filterSet of levels) {
                  const ctx = makeContext(filterSet);
                  const localCandidates = await retrieveLocalCandidates(
                    ctx,
                    RECO_FAST_LOCAL_POOL,
                  );
                  processed = processPool(localCandidates, ctx);

                  if (processed.length < RECO_CACHE_MAX_JOBS) {
                    const externalRaw = await fetchExternalDeep({
                      apiTerm: bgPrimaryTitles[0] || 'jobs',
                      country: filterSet.country || 'IN',
                      state: filterSet.state,
                      city: filterSet.city,
                      minRequired: RECO_CACHE_MAX_JOBS,
                      maxPages: 6,
                    });

                    if (externalRaw.length) {
                      const formatted = externalRaw.map((job) =>
                        transformRapidApiJob(job, bgPrimaryIntent),
                      );
                      await upsertExternalJobs(formatted).catch((err) =>
                        console.error(
                          'Recommended jobs background upsert error:',
                          err.message,
                        ),
                      );
                      processed = processPool(
                        dedupeByTitleCompany([...localCandidates, ...formatted]),
                        ctx,
                      );
                    }
                  }

                  if (processed.length >= RECO_CACHE_MAX_JOBS) break;
                }

                const cachedPayload = {
                  jobs: processed.slice(0, RECO_CACHE_MAX_JOBS),
                  totalJobs: processed.length,
                };
                await redisClient.set(
                  recoCacheKey,
                  JSON.stringify(cachedPayload),
                  600,
                );
              } catch (err) {
                console.error(
                  'Recommended jobs background refresh failed:',
                  err?.message || err,
                );
              }
            });
          }

          return res.status(200).json({
            success: true,
            pagination: {
              currentPage: pageNum,
              hasNextPage:
                (cachedReco?.totalJobs || cachedJobs.length) > skip + jobsWithViews.length,
              totalJobs: cachedReco?.totalJobs || cachedJobs.length,
            },
            jobs: jobsWithViews,
          });
        }
      } catch (err) {
        console.warn('Recommended jobs cache parse failed:', err?.message);
      }
    }

    const interactions = await buildInteractionContext(req.user._id);

    // ===============================
    // 🔥 1. CLEAN PRIMARY INTENT
    // ===============================
    const primaryTitles = normalizeSet(profile.titles || []);
    const primaryIntent = primaryTitles.join(' ').trim() || 'jobs';

    const secondarySkills = normalizeSet(profile.skills || []).slice(0, 5);
    const vectorQuery = `${primaryIntent} ${secondarySkills.join(' ')}`.trim();

    const country = profile.location?.country || 'IN';
    const state = profile.location?.state;
    const city = profile.location?.city;

    const makeContext = (filterOverride) => ({
      type: 'recommendation',
      query: primaryIntent, // 🔥 keyword only from titles
      vectorQuery, // 🔥 full profile only for vector
      profile,
      filters: filterOverride,
      userId: req.user._id,
      interactions,
    });

    const processPool = (jobsPool, ctx) => {
      const validJobs = jobsPool.filter(
        (job) => job.description && job.description.trim().length > 0,
      );
      const filtered = applyFilters(validJobs, ctx);
      const ranked = rankJobsWithIntentBoost(filtered, ctx);
      return ranked;
    };

    const API_TIMEOUT = 8000;
    const apiTerm = primaryTitles[0] || 'jobs';
    const apiStartPage = Math.max(1, pageNum);

    const levels = [
      ...(city ? [{ country, state, city }] : []),
      ...(state ? [{ country, state, city: null }] : []),
      { country, state: null, city: null },
      { country: null, state: null, city: null },
    ];

    let finalJobs = [];
    let processed = [];

    for (const filterSet of levels) {
      const ctx = makeContext(filterSet);

      const poolSize = RECO_FAST_LOCAL_POOL;
      const localCandidates = await retrieveLocalCandidates(ctx, poolSize);

      processed = processPool(localCandidates, ctx);
      finalJobs = processed.slice(skip, skip + limitNum);

      if (processed.length >= skip + limitNum) break;
    }

    finalJobs = diversify(finalJobs);
    const jobsWithViews = await attachJobViews(finalJobs);

    const payload = {
      success: true,
      pagination: {
        currentPage: pageNum,
        hasNextPage: processed.length > skip + jobsWithViews.length,
        totalJobs: processed.length,
      },
      jobs: jobsWithViews,
    };

    await redisClient.set(
      recoCacheKey,
      JSON.stringify({
        jobs: processed.slice(0, RECO_CACHE_MAX_JOBS),
        totalJobs: processed.length,
      }),
      600,
    );

    // Warm prefetch cache for page 1 so reloads are instant
    if (pageNum === 1 && limitNum <= 10 && jobsWithViews.length > 0) {
      void setPrefetchedJobs(req.user._id, {
        jobs: jobsWithViews,
        pagination: payload.pagination,
      });
    }

    const syncKey = `${req.user._id}:${pageNum}:${limitNum}`;
    const lastSyncAt = syncCooldown.get(syncKey) || 0;
    if (Date.now() - lastSyncAt > RECO_SYNC_COOLDOWN_MS) {
      syncCooldown.set(syncKey, Date.now());
      setImmediate(async () => {
        try {
          const levelsForSync = [
            ...(city ? [{ country, state, city }] : []),
            ...(state ? [{ country, state, city: null }] : []),
            { country, state: null, city: null },
            { country: null, state: null, city: null },
          ];

          let backgroundProcessed = processed;

          for (const filterSet of levelsForSync) {
            const ctx = makeContext(filterSet);
            const localCandidates = await retrieveLocalCandidates(
              ctx,
              RECO_FAST_LOCAL_POOL,
            );
            backgroundProcessed = processPool(localCandidates, ctx);

            if (backgroundProcessed.length < RECO_CACHE_MAX_JOBS) {
              const externalRaw = await fetchExternalDeep({
                apiTerm,
                country: filterSet.country || 'IN',
                state: filterSet.state,
                city: filterSet.city,
                minRequired: RECO_CACHE_MAX_JOBS,
                maxPages: 6,
              });

              if (externalRaw.length) {
                const formatted = externalRaw.map((job) =>
                  transformRapidApiJob(job, primaryIntent),
                );
                await upsertExternalJobs(formatted).catch((err) =>
                  console.error(
                    'Recommended jobs background upsert error:',
                    err.message,
                  ),
                );
                backgroundProcessed = processPool(
                  dedupeByTitleCompany([...localCandidates, ...formatted]),
                  ctx,
                );
              }
            }

            if (backgroundProcessed.length >= RECO_CACHE_MAX_JOBS) break;
          }

          await redisClient.set(
            recoCacheKey,
            JSON.stringify({
              jobs: backgroundProcessed.slice(0, RECO_CACHE_MAX_JOBS),
              totalJobs: backgroundProcessed.length,
            }),
            600,
          );
        } catch (err) {
          console.error(
            'Recommended jobs background refresh failed:',
            err?.message || err,
          );
        }
      });
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error('API Reco Error:', error);
    return res.status(500).json({ success: false });
  }
}

async function getTop4DashboardJobs(profile) {
  // Build a stable bucket key from the user's primary title/location
  // so we re-use cached results when the profile hasn't changed.
  const bucket = [
    (profile.titles[0] || 'any').toLowerCase().replace(/\s+/g, '-'),
    (profile.location?.country || 'IN').toUpperCase(),
  ].join(':');

  const cacheKey = makeTop4Key(profile.userId, bucket);

  // 1. Return cached results if fresh
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // corrupt cache — fall through to re-fetch
    }
  }

  // 2. Build search context from profile
  const profileQuery =
    `${profile.titles.join(' ')} ${profile.skills.join(' ')}`.trim() || 'jobs';

  const context = {
    type: 'recommendation',
    query: profileQuery,
    profile,
    filters: {
      country: profile.location?.country || 'IN',
      state: profile.location?.state,
      city: profile.location?.city,
    },
    userId: profile.userId,
    interactions: null, // skip heavy interaction loads for the lightweight dashboard widget
  };

  // 3. Fetch a small local pool (40 is plenty for picking 4)
  let candidates = [];
  try {
    candidates = await retrieveLocalCandidates(context, 40);
  } catch (e) {
    console.error(
      '[getTop4DashboardJobs] retrieveLocalCandidates error:',
      e.message,
    );
  }

  // 4. Filter → rank → take 4
  const filtered = applyFilters(candidates, {
    ...context,
    interactions: { applied: new Set(), saved: new Set(), views: {} },
  });
  const ranked = rankJobs(filtered, context);
  const top4 = ranked.slice(0, 4);

  // 5. Store in Redis for 10 min
  if (top4.length > 0) {
    await redisClient.set(cacheKey, JSON.stringify(top4), 600);
  }

  return top4;
}

export const getDashboardTopJobs = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.sendStatus(401);

  try {
    const profile = await buildUserProfileFromStudent(userId);
    profile.userId = userId;

    const jobs = await getTop4DashboardJobs(profile);

    return res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard jobs',
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

export const toggleAutopilot = async (req, res, next) => {
  try {
    const studentId = req.user._id; // Assuming `req.user` is set by your auth middleware

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
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
    console.error('Error toggling autopilot:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to toggle autopilot' });
  }
};

export const getAutopilotStatus = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({
      success: true,
      autopilotStatus: student.settings.autopilotEnabled,
    });
  } catch (error) {
    console.error('Error getting autopilot status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get autopilot status',
    });
  }
};

export const jobViewedByStudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const or = [{ slug: jobId }];
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      or.unshift({ _id: jobId });
    }

    const job = await Job.findOne({ $or: or })
      .select('_id title salary location jobTypes company')
      .lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const student = await Student.findById(studentId).select('viewedJobs');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // <- fixed: check the correct property name and initialize it
    if (!Array.isArray(student.viewedJobs)) {
      student.viewedJobs = [];
    }

    const now = new Date();

    // <- consistent key: viewedAt
    const existing = student.viewedJobs.find(
      (vj) => vj.job && vj.job.toString() === job._id.toString(),
    );

    if (existing) {
      existing.viewedAt = now;
    } else {
      student.viewedJobs.push({ job: job._id, viewedAt: now });
    }

    await student.save();

    try {
      if (redisClient?.invalidateJobCacheForStudent) {
        await redisClient.invalidateJobCacheForStudent(
          studentId,
          job._id.toString(),
        );
      }
      if (redisClient?.del) {
        await redisClient.del(`student:${studentId}:viewedJobs`);
        await redisClient.del(`stats:${studentId}`);
      }
    } catch (e) {
      console.error('Redis invalidate error:', e);
    }

    addCredits(req.user, 1);

    return res.status(200).json({
      success: true,
      message: 'Job marked as viewed successfully.',
      job,
    });
  } catch (error) {
    console.error('Error in jobVisitedByStudent:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const isStudentViewedJob = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { jobId } = req.params;
    const cacheKey = `student:${studentId}:isViewed:${jobId}`;

    const isViewed = await redisClient.withCache(cacheKey, 1800, async () => {
      const jobExists = await Job.findById(jobId).select('_id').lean();
      if (!jobExists) {
        throw new Error('Job not found');
      }

      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      return student.viewedJobs.some(
        (viewedJob) => viewedJob.slug.toString() === jobId,
      );
    });

    res.status(200).json({ success: true, isViewed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const jobVisitedByStudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const or = [{ slug: jobId }];
    if (mongoose.Types.ObjectId.isValid(jobId)) or.unshift({ _id: jobId });

    // find the job (single doc)
    const job = await Job.findOne({ $or: or })
      .select('_id title salary location jobTypes company')
      .lean();

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // ensure student exists
    const student = await Student.findById(studentId).select('visitedJobs');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const now = new Date();

    // 1) Try to atomically update an existing visitedJobs entry
    const updateExisting = await Student.updateOne(
      { _id: studentId, 'visitedJobs.job': job._id },
      { $set: { 'visitedJobs.$.visitedAt': now } },
    );

    // 2) If no existing entry was updated, push a new one (atomic)
    if (!updateExisting.modifiedCount && updateExisting.matchedCount !== 0) {
      // matched but nothing modified (rare) -> still safe to push
      await Student.updateOne(
        { _id: studentId },
        { $push: { visitedJobs: { job: job._id, visitedAt: now } } },
      );
    } else if (!updateExisting.matchedCount) {
      // no matched element -> push
      await Student.updateOne(
        { _id: studentId },
        { $push: { visitedJobs: { job: job._id, visitedAt: now } } },
      );
    }

    // invalidate cache if available
    try {
      if (redisClient?.invalidateJobCacheForStudent) {
        await redisClient.invalidateJobCacheForStudent(
          studentId,
          job._id.toString(),
        );
      }
      if (redisClient?.del) {
        await redisClient.del(`student:${studentId}:visitedJobs`);
        await redisClient.del(`stats:${studentId}`);
      }
    } catch (e) {
      console.error('Redis invalidate error:', e);
    }

    await addCredits(
      student._id,
      CREDIT_EARN.VISITJOB_SITE,
      'jobVisitedByStudent',
    );

    return res.status(200).json({
      success: true,
      message: 'Job marked as visited successfully.',
      job,
    });
  } catch (error) {
    console.error('Error in jobVisitedByStudent:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const isJobVisitedByStudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;
    const cacheKey = `student:${studentId}:isVisited:${jobId}`;

    const isVisited = await redisClient.withCache(cacheKey, 1800, async () => {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      return student.visitedJobs.some(
        (visitedJob) => visitedJob.job.toString() === jobId,
      );
    });

    res.status(200).json({ success: true, isVisited });
  } catch (error) {
    console.error('Error in isJobVisitedByStudent:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get All Jobs with Caching
export const getAllVisitedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;
    const cacheKey = `student:${studentId}:visitedJobs`;

    const visitedJobs = await redisClient.withCache(
      cacheKey,
      1800,
      async () => {
        const student = await Student.findById(studentId)
          .select('visitedJobs')
          .populate({
            path: 'visitedJobs.job',
            select: 'title company salary location jobTypes slug',
          });

        if (!student) {
          throw new Error('Student not found');
        }

        return student.visitedJobs;
      },
    );

    res.status(200).json({ success: true, jobs: visitedJobs });
  } catch (error) {
    console.error('Error in getAllVisitedJobs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllViewedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;
    const cacheKey = `student:${studentId}:viewedJobs`;

    const viewedJobs = await redisClient.withCache(cacheKey, 1800, async () => {
      const student = await Student.findById(studentId)
        .select('viewedJobs')
        .populate({
          path: 'viewedJobs.job',
          select: 'title company salary location jobTypes slug',
        });

      if (!student) {
        throw new Error('Student not found');
      }

      return student.viewedJobs;
    });

    res.status(200).json({ success: true, jobs: viewedJobs });
  } catch (error) {
    console.error('Error fetching viewed jobs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Enhanced Saved Jobs with Better Caching
export const toggleSavedJob = async (req, res) => {
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

    // Clean up invalid viewedJobs entries
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
    let isSaved;

    if (jobIndex > -1) {
      student.savedJobs.splice(jobIndex, 1);
      message = 'Job removed from saved list.';
      isSaved = false;
    } else {
      student.savedJobs.push({ job: jobId });
      message = 'Job saved successfully.';
      isSaved = true;
    }

    await Student.updateOne(
      { _id: studentId },
      {
        $set: {
          savedJobs: student.savedJobs,
          viewedJobs: student.viewedJobs,
        },
      },
    );

    // Enhanced cache invalidation
    await redisClient.invalidateStudentCache(studentId);
    await redisClient.del(`student:${studentId}:savedJobs`);
    await redisClient.del(`student:${studentId}:isSaved:${jobId}`);
    await redisClient.del(`stats:${studentId}`);

    // Pre-warm the cache with new state
    await redisClient.set(
      `student:${studentId}:isSaved:${jobId}`,
      JSON.stringify(isSaved),
      1800,
    );

    return res.status(200).json({ success: true, message, isSaved });
  } catch (error) {
    console.error('Error toggling saved job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSavedJobs = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:savedJobs`;

  try {
    const savedJobs = await redisClient.withCache(cacheKey, 1800, async () => {
      const student = await Student.findById(studentId).populate({
        path: 'savedJobs.job',
        select: 'title company salary location jobTypes slug -_id',
        options: { lean: true },
      });

      if (!student) throw new Error('Student not found');
      return student.savedJobs;
    });

    return res.status(200).json({ success: true, savedJobs });
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllSavedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;
    const cacheKey = `student:${studentId}:savedJobs`;

    const savedJobs = await redisClient.withCache(cacheKey, 1800, async () => {
      const student = await Student.findById(studentId)
        .select('savedJobs')
        .populate({
          path: 'savedJobs.job',
          select: 'title company salary location jobTypes slug',
        });

      if (!student) {
        throw new Error('Student not found');
      }

      return student.savedJobs;
    });

    res.status(200).json({ success: true, jobs: savedJobs });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const isSavedOrNot = async (req, res) => {
  const studentId = req.user._id;
  const { jobId } = req.query;
  const cacheKey = `student:${studentId}:isSaved:${jobId}`;

  try {
    const isSaved = await redisClient.withCache(cacheKey, 1800, async () => {
      const student = await Student.findById(studentId);
      if (!student) throw new Error('Student not found');

      return student.savedJobs.some(
        (savedItem) =>
          (savedItem.job?.toString() || savedItem.toString()) === jobId,
      );
    });

    return res.status(200).json({ success: true, isSaved });
  } catch (error) {
    console.error('Error checking saved status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Enhanced Stats with Caching
export const getAllStatCounts = async (req, res) => {
  try {
    const studentId = req.user._id;
    const cacheKey = `stats:${studentId}`;

    const statCounts = await redisClient.withCache(cacheKey, 900, async () => {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // You might want to add appliedJobsCount logic here
      const appliedJobsCount = 0; // Replace with actual logic

      return {
        viewedJobsCount: student.viewedJobs.length,
        visitedJobsCount: student.visitedJobs.length,
        savedJobsCount: student.savedJobs.length,
        appliedJobsCount,
      };
    });

    res.status(200).json({ success: true, statCounts });
  } catch (error) {
    console.error('Error in getAllStatCounts:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Batch Operations for Better Performance
export const getMultipleJobStatuses = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds)) {
      return res.status(400).json({ message: 'jobIds must be an array' });
    }

    const statuses = {};
    const cacheKeys = jobIds.map(
      (jobId) => `student:${studentId}:isSaved:${jobId}`,
    );

    // Try to get all from cache first
    const cachedResults = await redisClient.mget(cacheKeys);

    for (let i = 0; i < jobIds.length; i++) {
      const jobId = jobIds[i];
      const cached = cachedResults[i];

      if (cached) {
        statuses[jobId] = { isSaved: JSON.parse(cached) };
      } else {
        // Fallback to database for uncached items
        const student = await Student.findById(studentId);
        const isSaved = student.savedJobs.some(
          (savedItem) =>
            (savedItem.job?.toString() || savedItem.toString()) === jobId,
        );
        statuses[jobId] = { isSaved };

        // Cache the result
        await redisClient.set(
          `student:${studentId}:isSaved:${jobId}`,
          JSON.stringify(isSaved),
          1800,
        );
      }
    }

    res.status(200).json({ success: true, statuses });
  } catch (error) {
    console.error('Error in getMultipleJobStatuses:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getTotalCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const totalCredits = user.credits || 0;
    res.status(200).json({ success: true, credits: totalCredits });
  } catch (error) {
    console.error('Error in getTotalCredits:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCreditsSummary = async (req, res) => {
  const { _id: userId } = req.user;

  try {
    if (!userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const [user, agentCount] = await Promise.all([
      User.findById(userId).lean(),
      StudentAgent.countDocuments({ student: userId }),
    ]);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const txs = Array.isArray(user.creditTransactions)
      ? user.creditTransactions
      : [];

    let totalEarned = 0;
    let totalSpent = 0;
    txs.forEach((t) => {
      if (!t || typeof t.amount !== 'number') return;
      if (t.type === 'EARN') totalEarned += t.amount;
      if (t.type === 'SPEND') totalSpent += t.amount;
    });

    const lastTxOfKind = (kind, metaFilter = {}) => {
      const filtered = txs
        .filter((t) => t.kind === kind)
        .filter((t) => {
          if (!metaFilter || Object.keys(metaFilter).length === 0) return true;
          if (!t.meta) return false;
          for (const k of Object.keys(metaFilter)) {
            if (String(t.meta[k]) !== String(metaFilter[k])) return false;
          }
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return filtered.length ? filtered[0] : null;
    };

    const hasClaimedKind = (kind, metaFilter = {}) =>
      !!lastTxOfKind(kind, metaFilter);

    // helper to infer URLs for actions (same mapping you used in earnCreditsForAction)
    const redirectForAction = (act, m = {}) => {
      if (m && m.redirectUrl) return m.redirectUrl;

      switch (act) {
        case 'FIRST_CV':
        case 'CV_GENERATION':
          return '/dashboard/cv-generator';

        case 'FIRST_CL':
          return '/dashboard/cover-letter-generator';

        case 'DAILY_CHECKIN':
          return '/rewards';

        case 'FOLLOW_LINKEDIN':
          return 'https://www.linkedin.com/company/zobsai-com/';
        case 'FOLLOW_INSTAGRAM':
          return 'https://www.instagram.com/zobsai.co';
        case 'FOLLOW_FACEBOOK':
          return 'https://www.facebook.com/zobsai.co';
        case 'FOLLOW_YOUTUBE':
          return 'https://www.youtube.com/@Zobsai.official/';
        case 'FOLLOW_TIKTOK':
          return '/social-follow';

        case 'READ_BLOG':
          return m.blogUrl || '/blogs';

        case 'VISITJOB_SITE':
        case 'APPLY_ON_COMPANY_SITE':
          return '/dashboard/search-jobs';

        case 'PROFILE_COMPLETE_PERSONAL':

        case 'PROFILE_COMPLETE_EDUCATION':
          return '/dashboard/profile?tab=education';

        case 'PROFILE_COMPLETE_EXPERIENCE':
          return '/dashboard/profile?tab=experience';

        case 'PROFILE_COMPLETE_PROJECT':
          return '/dashboard/profile?tab=project';

        case 'PROFILE_COMPLETE_SKILL':
          return '/dashboard/profile?tab=skills';

        case 'ALLOW_BROWSER_NOTIF':
          return '/settings/notifications';

        case 'FIRST_AUTO_AGENT_SETUP':
        case 'FIRST_AUTO_APPLICATION_SENT':
          return '/dashboard/ai-auto-apply';

        default:
          return '/rewards';
      }
    };

    const pending = [];

    // FIRST_CV: keep your original logic but add url (client decides whether to show claim button)
    if (
      !hasClaimedKind('FIRST_CV') &&
      !(Array.isArray(user.htmlCV) && user.htmlCV.length > 0)
    ) {
      pending.push({
        action: 'FIRST_CV',
        credits: CREDIT_EARN.FIRST_CV || 0,
        reason: 'Generate your first CV to claim these credits.',
        url: redirectForAction('FIRST_CV'),
      });
    }

    if (
      !hasClaimedKind('FIRST_CL') &&
      !(Array.isArray(user.coverLetter) && user.coverLetter.length > 0)
    ) {
      pending.push({
        action: 'FIRST_CL',
        credits: CREDIT_EARN.FIRST_CL || 0,
        reason: 'Generate your first cover letter to claim these credits.',
        url: redirectForAction('FIRST_CL'),
      });
    }

    if (!hasClaimedKind('FIRST_AUTO_AGENT_SETUP') && agentCount === 0) {
      pending.push({
        action: 'FIRST_AUTO_AGENT_SETUP',
        credits: CREDIT_EARN.FIRST_AUTO_AGENT_SETUP || 0,
        reason: 'Set up your first Auto-Apply agent.',
        url: redirectForAction('FIRST_AUTO_AGENT_SETUP'),
      });
    }

    if (
      !hasClaimedKind('FIRST_AUTO_APPLICATION_SENT') &&
      Array.isArray(user.appliedJobs) &&
      user.appliedJobs.length === 0
    ) {
      pending.push({
        action: 'FIRST_AUTO_APPLICATION_SENT',
        credits: CREDIT_EARN.FIRST_AUTO_APPLICATION_SENT || 0,
        reason: 'Send your first auto-application to claim credits.',
        url: redirectForAction('FIRST_AUTO_APPLICATION_SENT'),
      });
    }

    if (!hasClaimedKind('PROFILE_COMPLETE_PERSONAL')) {
      const hasPersonal = !!(user.phone || user.profileImage);
      if (!hasPersonal) {
        pending.push({
          action: 'PROFILE_COMPLETE_PERSONAL',
          credits: CREDIT_EARN.PROFILE_COMPLETE_PERSONAL || 0,
          reason:
            'Add phone number or profile image to complete personal details.',
          url: redirectForAction('PROFILE_COMPLETE_PERSONAL'),
        });
      } else {
        pending.push({
          action: 'PROFILE_COMPLETE_PERSONAL',
          credits: CREDIT_EARN.PROFILE_COMPLETE_PERSONAL || 0,
          reason: 'Claim credits for completing personal details.',
          url: redirectForAction('PROFILE_COMPLETE_PERSONAL'),
        });
      }
    }

    if (!hasClaimedKind('PROFILE_COMPLETE_EDUCATION')) {
      const hasEducation =
        Array.isArray(user.education) && user.education.length > 0;
      if (!hasEducation) {
        pending.push({
          action: 'PROFILE_COMPLETE_EDUCATION',
          credits: CREDIT_EARN.PROFILE_COMPLETE_EDUCATION || 0,
          reason: 'Add education details to claim credits.',
          url: redirectForAction('PROFILE_COMPLETE_EDUCATION'),
        });
      } else {
        pending.push({
          action: 'PROFILE_COMPLETE_EDUCATION',
          credits: CREDIT_EARN.PROFILE_COMPLETE_EDUCATION || 0,
          reason: 'Claim credits for your education details.',
          url: redirectForAction('PROFILE_COMPLETE_EDUCATION'),
        });
      }
    }

    if (!hasClaimedKind('PROFILE_COMPLETE_EXPERIENCE')) {
      const hasExp =
        Array.isArray(user.experience) && user.experience.length > 0;
      if (!hasExp) {
        pending.push({
          action: 'PROFILE_COMPLETE_EXPERIENCE',
          credits: CREDIT_EARN.PROFILE_COMPLETE_EXPERIENCE || 0,
          reason: 'Add work experience to claim credits.',
          url: redirectForAction('PROFILE_COMPLETE_EXPERIENCE'),
        });
      } else {
        pending.push({
          action: 'PROFILE_COMPLETE_EXPERIENCE',
          credits: CREDIT_EARN.PROFILE_COMPLETE_EXPERIENCE || 0,
          reason: 'Claim credits for your experience details.',
          url: redirectForAction('PROFILE_COMPLETE_EXPERIENCE'),
        });
      }
    }

    if (!hasClaimedKind('PROFILE_COMPLETE_PROJECT')) {
      const hasProj = Array.isArray(user.projects) && user.projects.length > 0;
      if (!hasProj) {
        pending.push({
          action: 'PROFILE_COMPLETE_PROJECT',
          credits: CREDIT_EARN.PROFILE_COMPLETE_PROJECT || 0,
          reason: 'Add project details to claim credits.',
          url: redirectForAction('PROFILE_COMPLETE_PROJECT'),
        });
      } else {
        pending.push({
          action: 'PROFILE_COMPLETE_PROJECT',
          credits: CREDIT_EARN.PROFILE_COMPLETE_PROJECT || 0,
          reason: 'Claim credits for your project details.',
          url: redirectForAction('PROFILE_COMPLETE_PROJECT'),
        });
      }
    }

    if (!hasClaimedKind('PROFILE_COMPLETE_SKILL')) {
      const hasSkill = Array.isArray(user.skills) && user.skills.length > 0;
      if (!hasSkill) {
        pending.push({
          action: 'PROFILE_COMPLETE_SKILL',
          credits: CREDIT_EARN.PROFILE_COMPLETE_SKILL || 0,
          reason: 'Add skills to claim credits.',
          url: redirectForAction('PROFILE_COMPLETE_SKILL'),
        });
      } else {
        pending.push({
          action: 'PROFILE_COMPLETE_SKILL',
          credits: CREDIT_EARN.PROFILE_COMPLETE_SKILL || 0,
          reason: 'Claim credits for adding skills.',
          url: redirectForAction('PROFILE_COMPLETE_SKILL'),
        });
      }
    }

    // Allow browser notifications (one-time)
    if (!hasClaimedKind('ALLOW_BROWSER_NOTIF')) {
      const allowedFlag =
        user.settings && user.settings.allowBrowserNotifications;
      if (!allowedFlag) {
        pending.push({
          action: 'ALLOW_BROWSER_NOTIF',
          credits: CREDIT_EARN.ALLOW_BROWSER_NOTIF || 0,
          reason: 'Enable browser notifications to claim credits.',
          url: redirectForAction('ALLOW_BROWSER_NOTIF'),
        });
      } else {
        pending.push({
          action: 'ALLOW_BROWSER_NOTIF',
          credits: CREDIT_EARN.ALLOW_BROWSER_NOTIF || 0,
          reason: 'Claim credits for enabling browser notifications.',
          url: redirectForAction('ALLOW_BROWSER_NOTIF'),
        });
      }
    }

    const socialPlatforms = [
      { action: 'FOLLOW_LINKEDIN', label: 'LinkedIn' },
      { action: 'FOLLOW_INSTAGRAM', label: 'Instagram' },
      { action: 'FOLLOW_FACEBOOK', label: 'Facebook' },
      { action: 'FOLLOW_YOUTUBE', label: 'YouTube' },
      { action: 'FOLLOW_TIKTOK', label: 'TikTok' },
    ];
    socialPlatforms.forEach((p) => {
      if (!hasClaimedKind(p.action)) {
        pending.push({
          action: p.action,
          credits: CREDIT_EARN.FOLLOW_SOCIAL || 0,
          reason: `Follow us on ${p.label} and then claim this credit (server verification recommended).`,
          url: redirectForAction(p.action),
        });
      }
    });

    // generic job visit / apply pending items (no specific jobId available here)
    pending.push({
      action: 'VISITJOB_SITE',
      credits: CREDIT_EARN.VISITJOB_SITE || 0,
      reason:
        'Visit a job detail page (per job) to claim credits. Each job can be claimed once.',
      url: redirectForAction('VISITJOB_SITE'),
    });

    pending.push({
      action: 'APPLY_ON_COMPANY_SITE',
      credits: CREDIT_EARN.APPLY_ON_COMPANY_SITE || 1,
      reason:
        'Visit company career page via the job listing and apply to claim credit (per job).',
      url: redirectForAction('APPLY_ON_COMPANY_SITE'),
    });

    const lastDaily = lastTxOfKind('DAILY_CHECKIN');
    let dailyEligible = true;
    let lastDailyAt = null;
    if (lastDaily) {
      lastDailyAt = lastDaily.createdAt;
      const elapsed = Date.now() - new Date(lastDailyAt).getTime();
      if (elapsed < 24 * 60 * 60 * 1000) dailyEligible = false;
    }
    pending.push({
      action: 'DAILY_CHECKIN',
      credits: CREDIT_EARN.DAILY_CHECKIN || 0,
      reason: dailyEligible
        ? 'You can claim daily check-in now.'
        : `Already claimed. Next eligible after ${new Date(
            Date.now() +
              24 * 60 * 60 * 1000 -
              (Date.now() - new Date(lastDailyAt).getTime()),
          ).toISOString()}`,
      eligible: dailyEligible,
      lastClaimedAt: lastDailyAt || null,
      url: redirectForAction('DAILY_CHECKIN'),
    });

    // Prepare response: include redirectUrl on each tx (if present in tx.meta)
    const recentTxs = txs
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50)
      .map((t) => {
        const txCopy = Object.assign({}, t);
        if (t && t.meta && t.meta.redirectUrl) {
          txCopy.redirectUrl = t.meta.redirectUrl;
        } else {
          txCopy.redirectUrl = null;
        }
        return txCopy;
      });

    res.json({
      success: true,
      data: {
        userId: user._id,
        balance: Number(user.credits || 0),
        totalEarned,
        totalSpent,
        transactionsCount: txs.length,
        transactions: recentTxs,
        pendingClaims: pending,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const earnCreditsViaSocialLinks = async (req, res) => {
  try {
    const { action } = req.params;
    const user = req.user;
    const meta = req.body || {};

    if (!user)
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!action)
      return res
        .status(400)
        .json({ success: false, message: 'Missing action.' });
    if (!ALLOWED_SOCIAL_ACTIONS.has(action)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid social action.' });
    }

    const result = await earnCreditsForAction(user, action);

    return res.status(200).json({
      success: true,
      message: 'Credits awarded (if rules allowed).',
      tx: result.tx,
      balance: result.balance,
    });
  } catch (err) {
    console.error('claimSocialClick error', err);
    const status = err.status || 500;
    return res
      .status(status)
      .json({ success: false, message: err.message || 'Server error' });
  }
};

export const getVerifiedUsers = async (req, res) => {
  try {
    const { limit } = req.query;

    let size = 10;
    if (limit) {
      size = parseInt(limit);
    }

    const user = await User.find({
      isEmailVerified: true,
      authMethod: 'local',
    })
      .select('email')
      .limit(size);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecentAIActivity = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await Student.findById(studentId)
      .select('cvs cls tailoredApplications')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const getLatestCompleted = (items = []) =>
      items
        .filter((item) => item.status === 'completed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ||
      null;

    const latestCV = getLatestCompleted(student.cvs);
    const latestCoverLetter = getLatestCompleted(student.cls);
    const latestTailoredApplication = getLatestCompleted(
      student.tailoredApplications,
    );

    return res.json({
      success: true,
      data: {
        cv: latestCV && {
          id: latestCV._id,
          title: latestCV.cvTitle,
          status: latestCV.status,
          createdAt: latestCV.createdAt,
          completedAt: latestCV.completedAt,
        },
        coverLetter: latestCoverLetter && {
          id: latestCoverLetter._id,
          title: latestCoverLetter.clTitle,
          status: latestCoverLetter.status,
          createdAt: latestCoverLetter.createdAt,
          completedAt: latestCoverLetter.completedAt,
        },
        tailoredApplication: latestTailoredApplication && {
          id: latestTailoredApplication._id,
          jobTitle: latestTailoredApplication.jobTitle,
          companyName: latestTailoredApplication.companyName,
          status: latestTailoredApplication.status,
          createdAt: latestTailoredApplication.createdAt,
          completedAt: latestTailoredApplication.completedAt,
        },
      },
    });
  } catch (error) {
    console.error('Recent AI Activity Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent AI activity',
    });
  }
};
