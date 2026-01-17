import slugify from 'slugify';
import mongoose from 'mongoose';

// Student Models
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';
import { StudentCV } from '../models/students/studentCV.model.js';
import { StudentCL } from '../models/students/studentCL.model.js';
import { Student } from '../models/students/student.model.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';

// User Models
import { User } from '../models/User.model.js';

// Job Models
import { JobInteraction } from '../models/jobInteraction.model.js';

// import calculateExperience from '../utils/calculateExperience.js';
import redisClient from '../config/redis.js';
import { uploadBufferToCloudinary } from '../middlewares/multer.js';
import { Plan } from '../models/Plans.model.js';
import {
  buildUsageLimitsFromFeatures,
  calculateEndDate,
  safeGetVariant,
} from './plan.controller.js';
import { Purchase } from '../models/Purchase.js';
import { addCredits, CREDIT_EARN } from '../utils/credits.js';

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

export const getStudentDetails = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:details`;
  const TTL = 300;

  try {
    const student = await redisClient.withCache(cacheKey, TTL, async () => {
      let s = await Student.findById(studentId).lean();

      if (s) return s;

      const user = await User.findById(studentId).lean();
      if (!user) {
        throw { status: 404, message: 'User not found' };
      }
      if (user.role !== 'user') {
        throw {
          status: 403,
          message: 'Only users can have a student profile',
        };
      }

      const created = await Student.create({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      });

      return created.toObject();
    });

    return res.json({
      success: true,
      student,
      fromCache: false,
    });
  } catch (err) {
    console.error('getStudentDetails error:', err);
    return res
      .status(err?.status || 500)
      .json({ message: err.message || 'Internal server error' });
  }
};

export const updateStudentCoreProfile = async (req, res) => {
  const studentId = req.user._id;
  const { fullName, phone, jobRole, location } = req.body;

  const update = {};

  if (fullName !== undefined) update.fullName = fullName;
  if (phone !== undefined) update.phone = phone;
  if (jobRole !== undefined) update.jobRole = jobRole;
  if (location !== undefined) update.location = location;

  // ✅ Handle profile image upload
  if (req.file) {
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'students/profile-images',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      ],
    });

    update.profileImage = uploadResult.secure_url;
  }

  if (!Object.keys(update).length) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await redisClient.invalidateStudentCache(studentId);
    await redisClient.set(
      `student:${studentId}:details`,
      JSON.stringify(student.toObject()),
      300,
    );

    return res.json({
      success: true,
      student,
    });
  } catch (err) {
    console.error('updateStudentCoreProfile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const onboardingProfile = async (req, res) => {
  const studentId = req.user._id;
  const { data = {}, selectedOptions = {} } = req.body;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Core profile
    if (data.fullName) student.fullName = data.fullName;
    if (data.email) student.email = data.email;
    if (data.phone) student.phone = data.phone;
    if (data.location) student.location = data.location;
    if (data.designation) student.jobRole = data.designation;

    // Job preferences
    student.jobPreferences = student.jobPreferences || {};

    student.jobPreferences.preferredJobTypes = selectedOptions.jobType || [];

    student.jobPreferences.immediateAvailability =
      selectedOptions.availability === 'Immediately';

    if (data.location) {
      student.jobPreferences.preferredCities = data.location
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    }

    if (data.expectedSalary) {
      student.jobPreferences.preferredSalary = {
        min: parseInt(data.expectedSalary, 10) || null,
        currency: 'USD',
        period: 'YEAR',
      };
    }

    student.hasCompletedOnboarding = true;
    await student.save();

    await redisClient.invalidateStudentCache(studentId);
    await redisClient.set(
      `student:${studentId}:details`,
      JSON.stringify(student.toObject()),
      300,
    );

    return res.json({
      success: true,
      hasCompletedOnboarding: true,
    });
  } catch (err) {
    console.error('onboardingProfile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeOnboarding = async (req, res) => {
  const studentId = req.user._id;

  try {
    const student = await Student.findByIdAndUpdate(
      studentId,
      { hasCompletedOnboarding: true },
      { new: true },
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await redisClient.invalidateStudentCache(studentId);
    await redisClient.set(
      `student:${studentId}:details`,
      JSON.stringify(student.toObject()),
      300,
    );

    return res.json({
      success: true,
      message: 'Onboarding completed',
    });
  } catch (err) {
    console.error('completeOnboarding error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/* ================================================================== */
/* PROFILE COMPLETION                                                 */
/* ================================================================== */

export const getProfileCompletion = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:profileCompletion`;

  try {
    const completionData = await redisClient.withCache(
      cacheKey,
      86400, // 24 hours
      async () => {
        // 1. Fetch Core Student Data
        const student = await Student.findById(studentId).select(
          'fullName phone email jobRole location jobPreferences',
        );

        if (!student) throw new Error('Student not found');

        // 2. Fetch Related Data (using correct models)
        // We use lean() for better performance since we just need length
        const educations = await StudentEducation.find({
          student: studentId,
        }).lean();
        const experiences = await StudentExperience.find({
          student: studentId,
        }).lean();
        const skills = await StudentSkill.find({ student: studentId }).lean();
        const projects = await StudentProject.find({
          student: studentId,
        }).lean();

        // 3. Calculate Status
        const completionStatus = {
          coreProfile: Boolean(
            student.fullName && student.phone && student.jobRole,
          ),
          education: Boolean(educations?.length > 0),
          workExperience: Boolean(experiences?.length > 0),
          skills: Boolean(skills?.length > 0), // Assumes 5 is a good target
          projects: Boolean(projects?.length > 0),
          jobPreferences: Boolean(
            student.jobPreferences?.preferredCountries?.length > 0 ||
            student.jobPreferences?.preferredCities?.length > 0 ||
            student.jobPreferences?.mustHaveSkills?.length > 0,
          ),
        };

        console.log(completionStatus);

        if (completionStatus.coreProfile) {
          await addCredits(
            studentId,
            CREDIT_EARN.PROFILE_COMPLETE_PERSONAL,
            'profileCompleted',
          );
        }
        if (completionStatus.education) {
          await addCredits(
            studentId,
            CREDIT_EARN.PROFILE_COMPLETE_EDUCATION,
            'profileCompleted',
          );
        }

        if (completionStatus.workExperience) {
          await addCredits(
            studentId,
            CREDIT_EARN.PROFILE_COMPLETE_EXPERIENCE,
            'profileCompleted',
          );
        }

        if (completionStatus.skills) {
          await addCredits(
            studentId,
            CREDIT_EARN.PROFILE_COMPLETE_SKILL,
            'profileCompleted',
          );
        }

        if (completionStatus.projects) {
          await addCredits(
            studentId,
            CREDIT_EARN.PROFILE_COMPLETE_PROJECT,
            'profileCompleted',
          );
        }

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
    console.error('Error calculating profile completion:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/* ================================================================== */
/* SKILLS                                                             */
/* ================================================================== */

export const getSkills = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:skills`;

  try {
    const skills = await redisClient.withCache(
      cacheKey,
      3600, // 1 hour
      async () => {
        return await StudentSkill.find({ student: studentId })
          .sort({ order: 1 })
          .lean();
      },
    );
    res.json({ success: true, skills });
  } catch (error) {
    // Fallback if Redis fails
    const skills = await StudentSkill.find({ student: studentId })
      .sort({ order: 1 })
      .lean();
    res.json({ success: true, skills });
  }
};

export const addSkill = async (req, res) => {
  const studentId = req.user._id;
  const { skill, level = 'INTERMEDIATE', order = 0 } = req.body;

  if (!skill) {
    return res.status(400).json({ message: 'Skill is required' });
  }

  const skillId = slugify(skill, { lower: true, strict: true });

  try {
    const created = await StudentSkill.create({
      student: studentId,
      skill,
      level,
      order,
      skillId,
    });

    // Invalidate Cache
    await redisClient.del(`student:${studentId}:skills`);
    await redisClient.del(`student:${studentId}:profileCompletion`); // Update completion %

    res.status(201).json({ success: true, skill: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Skill already exists' });
    }
    throw err;
  }
};

export const updateSkill = async (req, res) => {
  const studentId = req.user._id;
  const { skillId } = req.params;
  const { level, order } = req.body;

  const update = {};
  if (level !== undefined) update.level = level;
  if (order !== undefined) update.order = order;

  const updated = await StudentSkill.findOneAndUpdate(
    { student: studentId, _id: skillId },
    { $set: update },
    { new: true },
  );

  if (!updated) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  // Invalidate Cache
  await redisClient.del(`student:${studentId}:skills`);

  res.json({ success: true, skill: updated });
};

export const deleteSkill = async (req, res) => {
  const studentId = req.user._id;
  const { skillId } = req.params;

  const result = await StudentSkill.deleteOne({
    student: studentId,
    _id: skillId,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  // Invalidate Cache
  await redisClient.del(`student:${studentId}:skills`);
  await redisClient.del(`student:${studentId}:profileCompletion`);

  res.json({ success: true });
};

/* ================================================================== */
/* EDUCATION                                                          */
/* ================================================================== */

export const getEducations = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:educations`;

  try {
    const educations = await redisClient.withCache(cacheKey, 3600, async () => {
      return await StudentEducation.find({ student: studentId })
        .sort({ order: 1 })
        .lean();
    });
    res.json({ success: true, educations });
  } catch (error) {
    const educations = await StudentEducation.find({ student: studentId })
      .sort({ order: 1 })
      .lean();
    res.json({ success: true, educations });
  }
};

export const addEducation = async (req, res) => {
  const studentId = req.user._id;
  const {
    institution: institute,
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    gpa: grade,
    country,
    isCurrentlyStudying = false,
    order = 0,
  } = req.body;

  if (!degree || !institute) {
    return res.status(400).json({ message: 'Degree and institute required' });
  }

  const educationId = slugify(`${degree}-${institute}-${Date.now()}`, {
    lower: true,
  });

  try {
    const created = await StudentEducation.create({
      student: studentId,
      educationId,
      institute,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      country,
      isCurrentlyStudying,
      order,
    });

    // Invalidate Cache
    await redisClient.del(`student:${studentId}:educations`);
    await redisClient.del(`student:${studentId}:profileCompletion`);

    res.status(201).json({ success: true, education: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Education already exists' });
    }
    throw err;
  }
};

export const updateEducation = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { educationId } = req.params;

    if (!educationId) {
      return res.status(400).json({ message: 'Education ID is required' });
    }

    const body = req.body?.data ?? req.body;
    const update = {};

    // 🔁 FIELD MAPPINGS (frontend → backend)
    if (body.institution !== undefined) update.institute = body.institution;
    if (body.degree !== undefined) update.degree = body.degree;
    if (body.fieldOfStudy !== undefined)
      update.fieldOfStudy = body.fieldOfStudy;
    if (body.startDate !== undefined) update.startDate = body.startDate;
    if (body.endDate !== undefined) update.endDate = body.endDate;
    if (body.gpa !== undefined) update.grade = body.gpa;
    if (body.country !== undefined) update.country = body.country;
    if (body.isCurrentlyStudying !== undefined)
      update.isCurrentlyStudying = body.isCurrentlyStudying;
    if (body.order !== undefined) update.order = body.order;

    // 🚫 Prevent empty update
    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update',
      });
    }

    const updated = await StudentEducation.findOneAndUpdate(
      { _id: educationId, student: studentId },
      { $set: update },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: 'Education not found' });
    }

    // 🧹 Invalidate cache
    await redisClient.del(`student:${studentId}:educations`);

    return res.json({
      success: true,
      education: updated,
    });
  } catch (error) {
    console.error('Update education error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteEducation = async (req, res) => {
  const studentId = req.user._id;
  const { educationId } = req.params;

  const result = await StudentEducation.deleteOne({
    student: studentId,
    _id: educationId,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Education not found' });
  }

  // Invalidate Cache
  await redisClient.del(`student:${studentId}:educations`);
  await redisClient.del(`student:${studentId}:profileCompletion`);

  res.json({ success: true });
};

/* ================================================================== */
/* EXPERIENCE                                                         */
/* ================================================================== */

// Helper for Experience Calc
function calculateExperience(startDate, endDate, currentlyWorking) {
  // Basic implementation placeholder - ensure you have this logic or import it
  const start = new Date(startDate);
  const end = currentlyWorking ? new Date() : new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return (diffDays / 365).toFixed(1); // Return years as float string
}

export const getExperiences = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:experiences`;

  try {
    const experiences = await redisClient.withCache(
      cacheKey,
      3600,
      async () => {
        return await StudentExperience.find({ student: studentId })
          .sort({ order: 1 })
          .lean();
      },
    );
    res.json({ success: true, experiences });
  } catch (error) {
    const experiences = await StudentExperience.find({ student: studentId })
      .sort({ order: 1 })
      .lean();
    res.json({ success: true, experiences });
  }
};

export const addExperience = async (req, res) => {
  const studentId = req.user._id;
  const {
    company,
    designation,
    startDate,
    endDate,
    currentlyWorking = false,
    employmentType,
    location,
    description,
    order = 0,
  } = req.body;

  if (!company || !designation || !startDate) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  // Ensure calculateExperience is defined or imported
  const experienceYrs = calculateExperience(
    startDate,
    endDate,
    currentlyWorking,
  );

  const experienceId = slugify(`${company}-${designation}-${Date.now()}`, {
    lower: true,
  });

  const capEmploymentType = employmentType
    ? employmentType.toUpperCase()
    : 'FULL-TIME';

  try {
    const created = await StudentExperience.create({
      student: studentId,
      experienceId,
      company,
      designation,
      startDate,
      endDate,
      currentlyWorking,
      employmentType: capEmploymentType,
      location,
      description,
      experienceYrs,
      order,
    });

    // Invalidate Cache
    await redisClient.del(`student:${studentId}:experiences`);
    await redisClient.del(`student:${studentId}:profileCompletion`);

    res.status(201).json({ success: true, experience: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Experience already exists' });
    }
    throw err;
  }
};

// export const updateExperience = async (req, res) => {
//   const studentId = req.user._id;
//   const { experienceId } = req.params;

//   const existing = await StudentExperience.findOne({
//     student: studentId,
//     _id: experienceId,
//   });

//   if (!existing) {
//     return res.status(404).json({ message: 'Experience not found' });
//   }

//   const allowed = [
//     'company',
//     'designation',
//     'startDate',
//     'endDate',
//     'currentlyWorking',
//     'employmentType',
//     'location',
//     'description',
//     'order',
//   ];

//   const update = {};
//   for (const key of allowed) {
//     console.log('key', key);
//     if (req.body[key] !== undefined) {
//       update[key] = req.body[key];
//     }
//   }

//   if (
//     update.startDate !== undefined ||
//     update.endDate !== undefined ||
//     update.currentlyWorking !== undefined
//   ) {
//     update.experienceYrs = calculateExperience(
//       update.startDate ?? existing.startDate,
//       update.endDate ?? existing.endDate,
//       update.currentlyWorking ?? existing.currentlyWorking,
//     );
//   }

//   const updated = await StudentExperience.findOneAndUpdate(
//     { student: studentId, _id: experienceId },
//     { $set: update },
//     { new: true },
//   );

//   // Invalidate Cache
//   await redisClient.del(`student:${studentId}:experiences`);
//   await redisClient.del(`student:${studentId}:profileCompletion`); // Yrs exp might change completion

//   res.json({ success: true, experience: updated });
// };

export const updateExperience = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { experienceId } = req.params;

    if (!experienceId) {
      return res.status(400).json({ message: 'Experience ID is required' });
    }

    // ✅ Support both payload shapes
    const body = req.body?.data ?? req.body;

    const existing = await StudentExperience.findOne({
      student: studentId,
      _id: experienceId,
    });

    if (!existing) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    const update = {};

    // ✅ Allowed + mapped fields
    if (body.company !== undefined) update.company = body.company;
    if (body.designation !== undefined) update.designation = body.designation;
    if (body.startDate !== undefined) update.startDate = body.startDate;
    if (body.endDate !== undefined) update.endDate = body.endDate;
    if (body.currentlyWorking !== undefined)
      update.currentlyWorking = body.currentlyWorking;
    if (body.employmentType !== undefined)
      update.employmentType = body.employmentType;
    if (body.location !== undefined) update.location = body.location;
    if (body.description !== undefined) update.description = body.description;
    if (body.order !== undefined) update.order = body.order;

    // 🚫 Prevent empty update
    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update',
      });
    }

    // 🧮 Recalculate experience years if needed
    if (
      update.startDate !== undefined ||
      update.endDate !== undefined ||
      update.currentlyWorking !== undefined
    ) {
      update.experienceYrs = calculateExperience(
        update.startDate ?? existing.startDate,
        update.endDate ?? existing.endDate,
        update.currentlyWorking ?? existing.currentlyWorking,
      );
    }

    const updated = await StudentExperience.findOneAndUpdate(
      { student: studentId, _id: experienceId },
      { $set: update },
      { new: true },
    );

    // 🧹 Invalidate cache
    await redisClient.del(`student:${studentId}:experiences`);
    await redisClient.del(`student:${studentId}:profileCompletion`);

    return res.json({
      success: true,
      experience: updated,
    });
  } catch (error) {
    console.error('Update experience error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteExperience = async (req, res) => {
  const studentId = req.user._id;
  const { experienceId } = req.params;

  const result = await StudentExperience.deleteOne({
    student: studentId,
    _id: experienceId,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Experience not found' });
  }

  // Invalidate Cache
  await redisClient.del(`student:${studentId}:experiences`);
  await redisClient.del(`student:${studentId}:profileCompletion`);

  res.json({ success: true });
};

/* ================================================================== */
/* PROJECTS                                                           */
/* ================================================================== */

export const getProjects = async (req, res) => {
  const studentId = req.user._id;
  const cacheKey = `student:${studentId}:projects`;

  try {
    const projects = await redisClient.withCache(cacheKey, 3600, async () => {
      return await StudentProject.find({ student: studentId })
        .sort({ order: 1 })
        .lean();
    });
    res.json({ success: true, projects });
  } catch (error) {
    const projects = await StudentProject.find({ student: studentId })
      .sort({ order: 1 })
      .lean();
    res.json({ success: true, projects });
  }
};

export const addProject = async (req, res) => {
  const studentId = req.user._id;
  const {
    projectName,
    description,
    technologies,
    link,
    startDate,
    endDate,
    isWorkingActive = false,
    order = 0,
  } = req.body;

  if (!projectName) {
    return res.status(400).json({ message: 'Project name required' });
  }

  const created = await StudentProject.create({
    student: studentId,
    projectName,
    description,
    technologies,
    link,
    startDate,
    endDate,
    isWorkingActive,
    order,
  });

  // Invalidate Cache
  await redisClient.del(`student:${studentId}:projects`);
  await redisClient.del(`student:${studentId}:profileCompletion`);

  res.status(201).json({ success: true, project: created });
};

export const updateProject = async (req, res) => {
  const studentId = req.user._id;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  const allowed = [
    'projectName',
    'description',
    'technologies',
    'link',
    'startDate',
    'endDate',
    'isWorkingActive',
    'order',
  ];

  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[key] = req.body[key];
    }
  }

  const updated = await StudentProject.findOneAndUpdate(
    { student: studentId, _id: projectId },
    { $set: update },
    { new: true },
  );

  if (!updated) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Invalidate Cache
  await redisClient.del(`student:${studentId}:projects`);

  res.json({ success: true, project: updated });
};

export const deleteProject = async (req, res) => {
  const studentId = req.user._id;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  const result = await StudentProject.deleteOne({
    student: studentId,
    _id: projectId,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Invalidate Cache
  await redisClient.del(`student:${studentId}:projects`);
  await redisClient.del(`student:${studentId}:profileCompletion`);

  res.json({ success: true });
};

//----- JOB INTERACTION -----//
export const trackJobEvent = async (req, res) => {
  const userId = req.user?._id;
  const { jobId, type, query, source } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid jobId' });
  }

  if (!['IMPRESSION', 'VIEW', 'VISIT'].includes(type)) {
    return res.status(400).json({ message: 'Invalid event type' });
  }

  if (type === 'VISIT') {
    await addCredits(userId, CREDIT_EARN.VISITJOB_SITE, 'jobVisitedByStudent');
  }

  await JobInteraction.create({
    user: userId,
    job: jobId,
    type,
    meta: { query, source },
  });

  res.status(201).json({ success: true });
};

export const toggleSaveJob = async (req, res) => {
  const userId = req.user._id;
  const { jobId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid jobId' });
  }

  const existing = await JobInteraction.findOne({
    user: userId,
    job: jobId,
    type: 'SAVED',
  });

  if (existing) {
    await JobInteraction.deleteOne({ _id: existing._id });
    return res.json({ success: true, saved: false });
  }

  await JobInteraction.create({
    user: userId,
    job: jobId,
    type: 'SAVED',
  });

  res.json({ success: true, saved: true });
};

export const applyToJob = async (req, res) => {
  const userId = req.user._id;
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid jobId' });
  }

  try {
    const interaction = await JobInteraction.create({
      user: userId,
      job: jobId,
      type: 'APPLIED',
      status: 'APPLIED',
    });

    res.status(201).json({
      success: true,
      application: interaction,
    });
  } catch (err) {
    // duplicate apply
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Already applied to this job' });
    }

    throw err;
  }
};

export const updateApplicationStatus = async (req, res) => {
  const userId = req.user._id;
  const { jobId } = req.params;
  const { status } = req.body;

  if (!['APPLIED', 'REJECTED', 'HIRED', 'WITHDRAWN'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const updated = await JobInteraction.findOneAndUpdate(
    {
      user: userId,
      job: jobId,
      type: 'APPLIED',
    },
    { $set: { status } },
    { new: true },
  );

  if (!updated) {
    return res.status(404).json({ message: 'Application not found' });
  }

  res.json({ success: true, application: updated });
};

export const getJobInteractionStatus = async (req, res) => {
  const userId = req.user._id;
  const { jobId } = req.params;

  const interactions = await JobInteraction.find({
    user: userId,
    job: jobId,
    type: { $in: ['SAVED', 'APPLIED'] },
  }).lean();

  res.json({
    saved: interactions.some((i) => i.type === 'SAVED'),
    applied: interactions.some((i) => i.type === 'APPLIED'),
  });
};

export const getSavedJobs = async (req, res) => {
  const userId = req.user._id;

  const { type } = req.query;

  const saved = await JobInteraction.find({
    user: userId,
    type,
  })
    .populate('job')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, jobs: saved });
};

export const getAppliedJobs = async (req, res) => {
  const userId = req.user._id;

  const applied = await JobInteraction.find({
    user: userId,
    type: 'APPLIED',
  })
    .populate('job')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, applications: applied });
};

export const getJobAnalytics = async (req, res) => {
  const { jobId } = req.params;

  const stats = await JobInteraction.aggregate([
    { $match: { job: new mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({ success: true, stats });
};

export const StudentAnalytics = async (req, res) => {
  const { _id: userId } = req.user;

  try {
    const [
      viewCount,
      visitCount,
      savedCount,
      appliedCount,
      cvCount,
      clCount,
      tailoredCount,
      user,
    ] = await Promise.all([
      JobInteraction.countDocuments({
        user: userId,
        type: 'VIEW',
      }),

      JobInteraction.countDocuments({
        user: userId,
        type: 'VISIT',
      }),

      JobInteraction.countDocuments({
        user: userId,
        type: 'SAVED',
      }),

      JobInteraction.countDocuments({
        user: userId,
        type: 'APPLIED',
      }),

      StudentCV.countDocuments({
        student: userId,
      }),

      StudentCL.countDocuments({
        student: userId,
      }),

      StudentTailoredApplication.countDocuments({
        student: userId,
      }),

      User.findById(userId)
        .select('referralCount referralCode isEmailVerified')
        .lean(),
    ]);

    return res.status(200).json({
      jobsViewed: viewCount,
      savedJobsCount: savedCount,
      jobsVisited: visitCount,

      appliedJobsCount: appliedCount,
      applicationsSent: appliedCount,

      cvsGenerated: cvCount,
      coverLettersGenerated: clCount,
      tailoredApplications: tailoredCount,

      referralCount: user?.referralCount || 0,
      referralCode: user?.referralCode || '',
      isEmailVerified: user?.isEmailVerified || false,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const checkoutCredits = async (req, res) => {
  const { _id } = req.user || {};
  const { items } = req.body || {};

  if (!_id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required',
    });
  }

  // Normalize and validate items
  const normalizedItems = items.map((it) => ({
    id: String(it.id || '').trim(),
    quantity: Number(it.quantity || 0),
  }));

  for (const item of normalizedItems) {
    if (!item.id || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Each item must have a valid id and quantity > 0',
      });
    }
    if (!CREDIT_COSTS[item.id]) {
      return res.status(400).json({
        success: false,
        message: `Unknown item id: ${item.id}`,
      });
    }
  }

  // Compute total cost on the server (never trust client)
  let totalCost = 0;
  for (const item of normalizedItems) {
    const unitCost = CREDIT_COSTS[item.id];
    totalCost += unitCost * item.quantity;
  }

  if (totalCost <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Total cost must be positive',
    });
  }

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const currentBalance = Number(user.credits || 0);
    if (currentBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits',
        data: {
          balance: currentBalance,
          required: totalCost,
        },
      });
    }

    // Spend credits and log transaction
    await spendCredits(user, totalCost, 'CREDITS_CHECKOUT', {
      items: normalizedItems,
    });

    // Ensure usageLimits exists
    if (!user.usageLimits) {
      user.usageLimits = {};
    }

    // Update usage limits according to what was purchased
    for (const item of normalizedItems) {
      const rule = USAGE_LIMIT_INCREMENTS[item.id];
      if (!rule || !rule.field) continue;

      const key = rule.field;
      const inc = (rule.perUnit || 1) * item.quantity;

      user.usageLimits[key] = Number(user.usageLimits[key] || 0) + inc;
    }

    // Let Mongoose know nested object changed (to be safe)
    user.markModified && user.markModified('usageLimits');

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Checkout successful',
      data: {
        balance: user.credits,
        usageLimits: user.usageLimits,
        creditTransactions: (user.creditTransactions || []).slice(-30),
      },
    });
  } catch (err) {
    console.error('checkoutCredits error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to checkout using credits',
    });
  }
};

export const getRecentAIActivity = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [latestCV, latestCoverLetter, latestTailoredApplication] =
      await Promise.all([
        StudentCV.findOne({
          student: studentId,
          status: 'completed',
        })
          .sort({ createdAt: -1 })
          .lean(),

        StudentCL.findOne({
          student: studentId,
          status: 'completed',
        })
          .sort({ createdAt: -1 })
          .lean(),

        StudentTailoredApplication.findOne({
          student: studentId,
          status: 'completed',
        })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    return res.json({
      success: true,
      data: {
        cv: latestCV
          ? {
              id: latestCV._id,
              title: latestCV.cvTitle,
              status: latestCV.status,
              createdAt: latestCV.createdAt,
              completedAt: latestCV.completedAt,
            }
          : null,

        coverLetter: latestCoverLetter
          ? {
              id: latestCoverLetter._id,
              title: latestCoverLetter.clTitle,
              status: latestCoverLetter.status,
              createdAt: latestCoverLetter.createdAt,
              completedAt: latestCoverLetter.completedAt,
            }
          : null,

        tailoredApplication: latestTailoredApplication
          ? {
              id: latestTailoredApplication._id,
              jobTitle: latestTailoredApplication.jobTitle,
              companyName: latestTailoredApplication.companyName,
              status: latestTailoredApplication.status,
              createdAt: latestTailoredApplication.createdAt,
              completedAt: latestTailoredApplication.completedAt,
            }
          : null,
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

/* -------------------- CONTROLLER -------------------- */

const normalizeSkills = (skills = []) =>
  skills
    .filter((s) => s?.skill && s.skill.trim() !== '')
    .map((s, index) => ({
      skillId: slugify(s.skill, { lower: true, strict: true }),
      skill: s.skill.trim(),
      level: s.level || 'BEGINNER',
      order: index,
    }));

const normalizeEducation = (education = []) =>
  education
    .map((e, index) => {
      const institute = e.institute?.trim() || e.institution?.trim() || '';

      if (!institute || !e.degree) return null;

      return {
        educationId: slugify(`${institute}-${e.degree}-${index}`, {
          lower: true,
          strict: true,
        }),
        institute,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy || '',
        country: e.country || '',
        startDate: e.startDate || '',
        endDate: e.graduationYear || '',
        grade: e.grade || '',
        order: index,
      };
    })
    .filter(Boolean);

const normalizeExperience = (experience = []) =>
  experience
    .filter((e) => e?.company && e?.title)
    .map((e, index) => ({
      experienceId: slugify(e.company, { lower: true, strict: true }),
      company: e.company,
      title: e.title,
      description: e.description || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      currentlyWorking: false,
      order: index,
    }));

const normalizeProjects = (projects = []) =>
  projects
    .filter((p) => p?.projectName)
    .map((p, index) => ({
      projectId: slugify(p.projectName, { lower: true, strict: true }),
      projectName: p.projectName,
      description: p.description || '',
      technologies: p.technologies
        ? p.technologies.split(',').map((t) => t.trim())
        : [],
      link: p.link || '',
      order: index,
    }));

/* ---------------- CONTROLLER ---------------- */
export const completeStudentOnboarding = async (req, res) => {
  console.log('completeStudentOnboarding');
  console.log('req.body', req.body);
  console.log('country', req.body.data.preferredCountries);

  const session = await mongoose.startSession();
  const userId = req.user?._id;

  try {
    await session.withTransaction(async () => {
      if (!userId) throw new Error('Unauthorized');

      const { data, selectedOptions } = req.body;

      if (!data?.fullName || !data?.email) {
        throw new Error('Missing required fields');
      }

      // --- Student update ---
      await Student.findByIdAndUpdate(
        userId,
        {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || null,
          jobRole: data.designation || null,
          location: data.location || null,

          jobPreferences: {
            preferredJobTypes: selectedOptions?.jobType || [],
            // preferredCountries: data?.preferredCountries
            //   ? [data?.preferredCountries] || []
            //   : [],
            // preferredCities: data.preferredCities ? [data.preferredCities] : [],
            preferredCities: Array.isArray(data.preferredCities)
              ? data.preferredCities
              : [],
            preferredCountries: Array.isArray(data.preferredCountries)
              ? data.preferredCountries
              : [],
            preferredEducationLevel: data.educationLevel || null,

            mustHaveSkills: Array.isArray(data.mustHaveSkills)
              ? data.mustHaveSkills
              : [],
            preferredSalary: data.expectedSalary
              ? {
                  min: Number(data.expectedSalary),
                  currency: 'INR',
                  period: 'monthly',
                }
              : undefined,
            immediateAvailability:
              selectedOptions?.availability === 'IMMEDIATE',
          },

          hasCompletedOnboarding: true,
        },

        { session, runValidators: true },
      );

      // --- Delete old profile data ---
      await StudentSkill.deleteMany({ student: userId }, { session });
      await StudentEducation.deleteMany({ student: userId }, { session });
      await StudentExperience.deleteMany({ student: userId }, { session });
      await StudentProject.deleteMany({ student: userId }, { session });

      // --- Insert new profile data ---
      const skills = normalizeSkills(data.skills);
      if (skills.length) {
        await StudentSkill.insertMany(
          skills.map((s) => ({ ...s, student: userId })),
          { session },
        );
      }

      const education = normalizeEducation(data.education);
      if (education.length) {
        await StudentEducation.insertMany(
          education.map((e) => ({ ...e, student: userId })),
          { session },
        );
      }

      const experience = normalizeExperience(data.experience);
      if (experience.length) {
        await StudentExperience.insertMany(
          experience.map((e) => ({ ...e, student: userId })),
          { session },
        );
      }

      const projects = normalizeProjects(data.projects);
      if (projects.length) {
        await StudentProject.insertMany(
          projects.map((p) => ({ ...p, student: userId })),
          { session },
        );
      }
    });

    session.endSession();

    // 🔥 IMPORTANT: invalidate Redis AFTER commit
    await redisClient.invalidateStudentCache(userId.toString());

    return res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    session.endSession();
    console.error('Onboarding error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete onboarding',
    });
  }
};

export const verifyStudentViaIdCardOrUniEmail = async (req, res) => {
  const { _id } = req.user;
  const { email } = req.body;
  const idCard = req.file;

  if (!email && !idCard) {
    return res.status(400).json({
      message: 'Provide either university email or ID card',
    });
  }

  try {
    const update = {};
    if (email) update.uniEmail = email;
    if (idCard) update.idCard = idCard.filename;

    const student = await Student.findByIdAndUpdate(_id, update, { new: true });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.updateOne(
      { _id },
      { $set: { role: 'uni-student', accountType: 'student' } },
    );

    return res.status(200).json({
      success: true,
      message: 'Student verified successfully',
      student,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Verification failed' });
  }
};

export const activateStudentPlan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    const planId = '6961eb3bf805a33f6861bfc5';
    const period = 'Monthly';

    const user = await User.findById(userId).session(session);
    if (!user || user.role !== 'uni-student') {
      throw new Error('Only verified students can activate this plan');
    }

    const plan = await Plan.findById(planId).lean();

    console.log(plan);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const variant = safeGetVariant(plan, period);
    if (!variant) {
      throw new Error('Invalid billing period');
    }

    // deactivate previous purchases
    await Purchase.updateMany(
      { user: userId, isActive: true },
      { $set: { isActive: false } },
      { session },
    );

    const paymentId = `student_free_${userId}_${Date.now()}`;

    const startDate = new Date();
    const endDate = calculateEndDate(period, startDate);

    const purchase = new Purchase({
      user: userId,
      plan: planId,
      purchaseType: 'student_free',
      billingVariant: {
        period,
        price: variant.price.effective,
      },
      amountPaid: 0,
      currency: 'inr',
      paymentStatus: 'completed',
      paymentGateway: 'none',
      paymentId,
      orderId: null,
      startDate,
      endDate,
      isActive: true,
    });

    await purchase.save({ session });

    user.currentPlan = planId;
    user.currentPurchase = purchase._id;
    user.usageLimits = buildUsageLimitsFromFeatures(variant.features || []);
    user.usageCounters = {
      cvCreation: 0,
      coverLetter: 0,
      aiApplication: 0,
      aiAutoApplyDailyLimit: 0,
      aiAutoApply: 0,
      atsScore: 0,
      jobMatching: 0,
      lastReset: new Date(),
    };

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Student plan activated successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Student activation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to activate student plan',
    });
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

    const user = await User.findById(userId).lean();
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
          return 'https://www.youtube.com/@ZobsAI';
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

    if (
      !hasClaimedKind('FIRST_AUTO_AGENT_SETUP') &&
      (!Array.isArray(user.autopilotAgent) || user.autopilotAgent.length === 0)
    ) {
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
