import mongoose from 'mongoose';
import slugify from 'slugify';

import redisClient from '../config/redis.js';
import { Student } from '../models/student.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import calculateExperience from '../utils/calculateExperience.js';

const SKILL_LEVELS = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

function cleanText(value) {
  return String(value ?? '').trim();
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', '1', 'y', 'on'].includes(normalized)) return true;
    if (['false', 'no', '0', 'n', 'off'].includes(normalized)) return false;
  }
  return undefined;
}

function toStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanText(item?.skill ?? item?.name ?? item))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => cleanText(item))
      .filter(Boolean);
  }

  return [];
}

function normalizeSkillLevel(level) {
  const candidate = cleanText(level).toUpperCase();
  return SKILL_LEVELS.has(candidate) ? candidate : 'INTERMEDIATE';
}

function normalizeEmploymentType(value) {
  const candidate = cleanText(value).toUpperCase().replace(/_/g, '-');
  const allowed = new Set([
    'FULL-TIME',
    'PART-TIME',
    'SELF-EMPLOYED',
    'FREELANCE',
    'INTERNSHIP',
    'CONTRACT',
    'APPRENTICESHIP',
  ]);

  return allowed.has(candidate) ? candidate : 'FULL-TIME';
}

function buildSkillId(skill) {
  return slugify(`${skill}-${Date.now()}`, { lower: true, strict: true });
}

function buildEducationId(education) {
  const institute = cleanText(education.institute || education.institution);
  const degree = cleanText(education.degree);
  return slugify(`${degree}-${institute}-${Date.now()}`, {
    lower: true,
    strict: true,
  });
}

function buildExperienceId(experience) {
  const company = cleanText(experience.company);
  const title = cleanText(experience.title || experience.designation);
  return slugify(`${company}-${title}-${Date.now()}`, {
    lower: true,
    strict: true,
  });
}

function mapProfilePatch(payload = {}) {
  const patch = {};

  if (payload.fullName !== undefined) patch.fullName = cleanText(payload.fullName);
  if (payload.email !== undefined) patch.email = cleanText(payload.email).toLowerCase();
  if (payload.phone !== undefined) patch.phone = cleanText(payload.phone);
  if (payload.jobRole !== undefined) patch.jobRole = cleanText(payload.jobRole);
  if (payload.designation !== undefined && patch.jobRole === undefined) {
    patch.jobRole = cleanText(payload.designation);
  }
  if (payload.location !== undefined) patch.location = payload.location;
  if (payload.profileImage !== undefined)
    patch.profileImage = cleanText(payload.profileImage);
  if (payload.resumeUrl !== undefined) patch.resumeUrl = cleanText(payload.resumeUrl);
  if (payload.uploadedCV !== undefined) patch.uploadedCV = cleanText(payload.uploadedCV);

  return patch;
}

function mapJobPreferencePatch(payload = {}) {
  const patch = {};

  const keys = [
    'preferredCountries',
    'preferredCities',
    'isRemote',
    'relocationWillingness',
    'preferredJobTitles',
    'preferredJobTypes',
    'preferredIndustries',
    'preferredExperienceLevel',
    'preferredSalary',
    'mustHaveSkills',
    'niceToHaveSkills',
    'preferredCertifications',
    'preferredEducationLevel',
    'preferredCompanySizes',
    'preferredCompanyCultures',
    'visaSponsorshipRequired',
    'immediateAvailability',
  ];

  for (const key of keys) {
    if (payload[key] === undefined) continue;

    if (key === 'mustHaveSkills' || key === 'niceToHaveSkills') {
      const list = Array.isArray(payload[key])
        ? payload[key]
        : typeof payload[key] === 'string'
          ? payload[key].split(',')
          : [];
      patch[key] = list
        .map((item) => ({
          skill: cleanText(item?.skill ?? item),
          level: normalizeSkillLevel(item?.level),
        }))
        .filter((item) => item.skill);
      continue;
    }

    if (key === 'preferredSalary' && payload[key] && typeof payload[key] === 'object') {
      patch[key] = {
        min:
          payload[key].min === '' || payload[key].min === undefined
            ? null
            : Number(payload[key].min),
        max:
          payload[key].max === '' || payload[key].max === undefined
            ? null
            : Number(payload[key].max),
        currency: cleanText(payload[key].currency || 'USD') || 'USD',
        period: payload[key].period || 'YEAR',
      };
      continue;
    }

    if (Array.isArray(payload[key])) {
      patch[key] = payload[key].map((value) => cleanText(value)).filter(Boolean);
      continue;
    }

    const booleanValue = toBoolean(payload[key]);
    patch[key] = booleanValue === undefined ? payload[key] : booleanValue;
  }

  return patch;
}

async function invalidateStudent(studentId) {
  try {
    await redisClient.invalidateStudentCache(studentId);
  } catch (error) {
    console.warn('Failed to invalidate student cache:', error);
  }
}

async function updateCoreProfile(studentId, payload = {}) {
  const patch = mapProfilePatch(payload);
  if (Object.keys(patch).length === 0) {
    return { status: 'skipped', message: 'No core profile fields were provided.' };
  }

  const student = await Student.findByIdAndUpdate(
    studentId,
    { $set: patch },
    { new: true, runValidators: true },
  ).lean();

  if (!student) {
    return { status: 'failed', message: 'Student not found.' };
  }

  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'profile',
    message: `Updated ${Object.keys(patch).join(', ')}.`,
    data: patch,
  };
}

async function updateJobPreferences(studentId, payload = {}) {
  const patch = mapJobPreferencePatch(payload);
  if (Object.keys(patch).length === 0) {
    return { status: 'skipped', message: 'No job preference fields were provided.' };
  }

  const update = {};
  for (const [key, value] of Object.entries(patch)) {
    update[`jobPreferences.${key}`] = value;
  }

  const student = await Student.findByIdAndUpdate(
    studentId,
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  if (!student) {
    return { status: 'failed', message: 'Student not found.' };
  }

  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'jobPreferences',
    message: `Updated job preferences: ${Object.keys(patch).join(', ')}.`,
    data: patch,
  };
}

async function addSkill(studentId, payload = {}) {
  const skill = cleanText(payload.skill);
  if (!skill) {
    return { status: 'needs_input', message: 'Skill name is required.' };
  }

  const level = normalizeSkillLevel(payload.level);
  const order = Number(payload.order ?? 0);
  const skillId = cleanText(payload.skillId) || buildSkillId(skill);

  const existing = await StudentSkill.findOne({
    student: studentId,
    skill: new RegExp(`^${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });

  if (existing) {
    existing.level = level;
    existing.order = Number.isFinite(order) ? order : existing.order;
    existing.skillId = existing.skillId || skillId;
    await existing.save();
    await invalidateStudent(studentId);
    return {
      status: 'applied',
      section: 'skills',
      message: `Updated existing skill "${skill}".`,
      data: existing.toObject(),
    };
  }

  const created = await StudentSkill.create({
    student: studentId,
    skillId,
    skill,
    level,
    order: Number.isFinite(order) ? order : 0,
  });

  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'skills',
    message: `Added skill "${skill}".`,
    data: created.toObject(),
  };
}

async function resolveSkill(studentId, match = {}, payload = {}) {
  const candidates = [
    match.id,
    match.skillId,
    payload.skillId,
    match.skill,
    payload.skill,
  ]
    .map(cleanText)
    .filter(Boolean);

  for (const candidate of candidates) {
    const byId = mongoose.Types.ObjectId.isValid(candidate)
      ? await StudentSkill.findOne({ student: studentId, _id: candidate })
      : await StudentSkill.findOne({
          student: studentId,
          $or: [
            { skillId: candidate },
            { skill: new RegExp(`^${candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          ],
        });
    if (byId) return byId;
  }

  return null;
}

async function updateSkill(studentId, match = {}, payload = {}) {
  const skill = await resolveSkill(studentId, match, payload);
  if (!skill) {
    return {
      status: 'needs_input',
      message: 'I could not identify which skill to update.',
    };
  }

  if (payload.skill !== undefined) skill.skill = cleanText(payload.skill);
  if (payload.level !== undefined) skill.level = normalizeSkillLevel(payload.level);
  if (payload.order !== undefined) skill.order = Number(payload.order);

  await skill.save();
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'skills',
    message: `Updated skill "${skill.skill}".`,
    data: skill.toObject(),
  };
}

async function deleteSkill(studentId, match = {}, payload = {}) {
  const skill = await resolveSkill(studentId, match, payload);
  if (!skill) {
    return {
      status: 'needs_input',
      message: 'I could not identify which skill to remove.',
    };
  }

  await StudentSkill.deleteOne({ _id: skill._id, student: studentId });
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'skills',
    message: `Removed skill "${skill.skill}".`,
  };
}

async function addEducation(studentId, payload = {}) {
  const institute = cleanText(payload.institute || payload.institution);
  const degree = cleanText(payload.degree);
  const fieldOfStudy = cleanText(payload.fieldOfStudy);

  if (!degree || !institute) {
    return {
      status: 'needs_input',
      message: 'Degree and institute are required to add education.',
    };
  }

  const educationId = cleanText(payload.educationId) || buildEducationId(payload);
  const existing = await StudentEducation.findOne({
    student: studentId,
    $or: [
      { educationId },
      {
        institute: new RegExp(`^${institute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        degree: new RegExp(`^${degree.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      },
    ],
  });

  if (existing) {
    if (payload.fieldOfStudy !== undefined) existing.fieldOfStudy = fieldOfStudy;
    if (payload.startDate !== undefined) existing.startDate = payload.startDate;
    if (payload.endDate !== undefined) existing.endDate = payload.endDate;
    if (payload.gpa !== undefined) existing.grade = payload.gpa;
    if (payload.country !== undefined) existing.country = payload.country;
    if (payload.isCurrentlyStudying !== undefined) {
      existing.isCurrentlyStudying = Boolean(toBoolean(payload.isCurrentlyStudying));
    }
    if (payload.order !== undefined) existing.order = Number(payload.order);
    await existing.save();
    await invalidateStudent(studentId);
    return {
      status: 'applied',
      section: 'education',
      message: `Updated existing education "${degree}" at "${institute}".`,
      data: existing.toObject(),
    };
  }

  const created = await StudentEducation.create({
    student: studentId,
    educationId,
    institute,
    degree,
    fieldOfStudy,
    country: cleanText(payload.country),
    startDate: payload.startDate,
    endDate: payload.endDate,
    grade: cleanText(payload.gpa),
    isCurrentlyStudying: Boolean(toBoolean(payload.isCurrentlyStudying)),
    order: Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0,
  });

  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'education',
    message: `Added education "${degree}" at "${institute}".`,
    data: created.toObject(),
  };
}

async function resolveEducation(studentId, match = {}, payload = {}) {
  const ids = [match.id, match.educationId, payload.educationId]
    .map(cleanText)
    .filter(Boolean);

  for (const id of ids) {
    const found = mongoose.Types.ObjectId.isValid(id)
      ? await StudentEducation.findOne({ student: studentId, _id: id })
      : await StudentEducation.findOne({
          student: studentId,
          educationId: id,
        });
    if (found) return found;
  }

  const institute = cleanText(match.institute || payload.institute || payload.institution);
  const degree = cleanText(match.degree || payload.degree);
  if (institute && degree) {
    return StudentEducation.findOne({
      student: studentId,
      institute: new RegExp(`^${institute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      degree: new RegExp(`^${degree.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
  }

  return null;
}

async function updateEducation(studentId, match = {}, payload = {}) {
  const education = await resolveEducation(studentId, match, payload);
  if (!education) {
    return {
      status: 'needs_input',
      message: 'I could not identify which education entry to update.',
    };
  }

  if (payload.institute !== undefined || payload.institution !== undefined) {
    education.institute = cleanText(payload.institute || payload.institution);
  }
  if (payload.degree !== undefined) education.degree = cleanText(payload.degree);
  if (payload.fieldOfStudy !== undefined)
    education.fieldOfStudy = cleanText(payload.fieldOfStudy);
  if (payload.startDate !== undefined) education.startDate = payload.startDate;
  if (payload.endDate !== undefined) education.endDate = payload.endDate;
  if (payload.gpa !== undefined) education.grade = cleanText(payload.gpa);
  if (payload.country !== undefined) education.country = cleanText(payload.country);
  if (payload.isCurrentlyStudying !== undefined) {
    education.isCurrentlyStudying = Boolean(toBoolean(payload.isCurrentlyStudying));
  }
  if (payload.order !== undefined) education.order = Number(payload.order);

  await education.save();
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'education',
    message: `Updated education "${education.degree || education.educationId}".`,
    data: education.toObject(),
  };
}

async function deleteEducation(studentId, match = {}, payload = {}) {
  const education = await resolveEducation(studentId, match, payload);
  if (!education) {
    return {
      status: 'needs_input',
      message: 'I could not identify which education entry to remove.',
    };
  }

  await StudentEducation.deleteOne({ _id: education._id, student: studentId });
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'education',
    message: `Removed education "${education.degree || education.educationId}".`,
  };
}

async function addExperience(studentId, payload = {}) {
  const company = cleanText(payload.company);
  const title = cleanText(payload.title || payload.designation);
  if (!company || (!title && !cleanText(payload.description))) {
    return {
      status: 'needs_input',
      message: 'Company and title or description are required to add experience.',
    };
  }

  const experienceId = cleanText(payload.experienceId) || buildExperienceId(payload);
  const created = await StudentExperience.create({
    student: studentId,
    experienceId,
    company,
    title,
    designation: cleanText(payload.designation || payload.title),
    employmentType: normalizeEmploymentType(payload.employmentType),
    location: cleanText(payload.location),
    startDate: payload.startDate,
    endDate: payload.endDate,
    currentlyWorking: Boolean(toBoolean(payload.currentlyWorking)),
    description: cleanText(payload.description),
    experienceYrs:
      payload.experienceYrs !== undefined
        ? Number(payload.experienceYrs)
        : calculateExperience(payload.startDate, payload.endDate, payload.currentlyWorking),
    order: Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0,
  });

  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'experience',
    message: `Added experience at "${company}".`,
    data: created.toObject(),
  };
}

async function resolveExperience(studentId, match = {}, payload = {}) {
  const ids = [match.id, match.experienceId, payload.experienceId]
    .map(cleanText)
    .filter(Boolean);

  for (const id of ids) {
    const found = mongoose.Types.ObjectId.isValid(id)
      ? await StudentExperience.findOne({ student: studentId, _id: id })
      : await StudentExperience.findOne({
          student: studentId,
          experienceId: id,
        });
    if (found) return found;
  }

  const company = cleanText(match.company || payload.company);
  const title = cleanText(match.title || match.designation || payload.title || payload.designation);
  if (company || title) {
    const query = { student: studentId };
    if (company) {
      query.company = new RegExp(`^${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (title) {
      query.$or = [
        { title: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { designation: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ];
    }
    return StudentExperience.findOne(query);
  }

  return null;
}

async function updateExperience(studentId, match = {}, payload = {}) {
  const experience = await resolveExperience(studentId, match, payload);
  if (!experience) {
    return {
      status: 'needs_input',
      message: 'I could not identify which experience entry to update.',
    };
  }

  if (payload.company !== undefined) experience.company = cleanText(payload.company);
  if (payload.title !== undefined) experience.title = cleanText(payload.title);
  if (payload.designation !== undefined)
    experience.designation = cleanText(payload.designation);
  if (payload.employmentType !== undefined)
    experience.employmentType = normalizeEmploymentType(payload.employmentType);
  if (payload.location !== undefined) experience.location = cleanText(payload.location);
  if (payload.startDate !== undefined) experience.startDate = payload.startDate;
  if (payload.endDate !== undefined) experience.endDate = payload.endDate;
  if (payload.description !== undefined)
    experience.description = cleanText(payload.description);
  if (payload.currentlyWorking !== undefined) {
    experience.currentlyWorking = Boolean(toBoolean(payload.currentlyWorking));
  }
  experience.experienceYrs = calculateExperience(
    experience.startDate,
    experience.endDate,
    experience.currentlyWorking,
  );
  if (payload.order !== undefined) experience.order = Number(payload.order);

  await experience.save();
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'experience',
    message: `Updated experience "${experience.company || experience.experienceId}".`,
    data: experience.toObject(),
  };
}

async function deleteExperience(studentId, match = {}, payload = {}) {
  const experience = await resolveExperience(studentId, match, payload);
  if (!experience) {
    return {
      status: 'needs_input',
      message: 'I could not identify which experience entry to remove.',
    };
  }

  await StudentExperience.deleteOne({ _id: experience._id, student: studentId });
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'experience',
    message: `Removed experience "${experience.company || experience.experienceId}".`,
  };
}

async function addProject(studentId, payload = {}) {
  const projectName = cleanText(payload.projectName);
  if (!projectName) {
    return {
      status: 'needs_input',
      message: 'Project name is required to add a project.',
    };
  }

  const existing = await StudentProject.findOne({
    student: studentId,
    projectName: new RegExp(`^${projectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });

  if (existing) {
    if (payload.description !== undefined)
      existing.description = cleanText(payload.description);
    if (payload.link !== undefined) existing.link = cleanText(payload.link);
    if (payload.technologies !== undefined)
      existing.technologies = toStringList(payload.technologies);
    if (payload.startDate !== undefined) existing.startDate = payload.startDate;
    if (payload.endDate !== undefined) existing.endDate = payload.endDate;
    if (payload.isWorkingActive !== undefined) {
      existing.isWorkingActive = Boolean(toBoolean(payload.isWorkingActive));
    }
    if (payload.order !== undefined) existing.order = Number(payload.order);
    await existing.save();
    await invalidateStudent(studentId);
    return {
      status: 'applied',
      section: 'projects',
      message: `Updated existing project "${projectName}".`,
      data: existing.toObject(),
    };
  }

  const created = await StudentProject.create({
    student: studentId,
    projectName,
    description: cleanText(payload.description),
    technologies: toStringList(payload.technologies),
    link: cleanText(payload.link),
    startDate: payload.startDate || undefined,
    endDate: payload.endDate || undefined,
    isWorkingActive: Boolean(toBoolean(payload.isWorkingActive)),
    order: Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0,
  });

  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'projects',
    message: `Added project "${projectName}".`,
    data: created.toObject(),
  };
}

async function resolveProject(studentId, match = {}, payload = {}) {
  const ids = [match.id, payload.id]
    .map(cleanText)
    .filter(Boolean);

  for (const id of ids) {
    const found = mongoose.Types.ObjectId.isValid(id)
      ? await StudentProject.findOne({ student: studentId, _id: id })
      : await StudentProject.findOne({ student: studentId, projectName: id });
    if (found) return found;
  }

  const projectName = cleanText(match.projectName || payload.projectName);
  if (!projectName) return null;

  return StudentProject.findOne({
    student: studentId,
    projectName: new RegExp(`^${projectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });
}

async function updateProject(studentId, match = {}, payload = {}) {
  const project = await resolveProject(studentId, match, payload);
  if (!project) {
    return {
      status: 'needs_input',
      message: 'I could not identify which project entry to update.',
    };
  }

  if (payload.projectName !== undefined)
    project.projectName = cleanText(payload.projectName);
  if (payload.description !== undefined)
    project.description = cleanText(payload.description);
  if (payload.link !== undefined) project.link = cleanText(payload.link);
  if (payload.technologies !== undefined)
    project.technologies = toStringList(payload.technologies);
  if (payload.startDate !== undefined) project.startDate = payload.startDate;
  if (payload.endDate !== undefined) project.endDate = payload.endDate;
  if (payload.isWorkingActive !== undefined) {
    project.isWorkingActive = Boolean(toBoolean(payload.isWorkingActive));
  }
  if (payload.order !== undefined) project.order = Number(payload.order);

  await project.save();
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'projects',
    message: `Updated project "${project.projectName}".`,
    data: project.toObject(),
  };
}

async function deleteProject(studentId, match = {}, payload = {}) {
  const project = await resolveProject(studentId, match, payload);
  if (!project) {
    return {
      status: 'needs_input',
      message: 'I could not identify which project entry to remove.',
    };
  }

  await StudentProject.deleteOne({ _id: project._id, student: studentId });
  await invalidateStudent(studentId);

  return {
    status: 'applied',
    section: 'projects',
    message: `Removed project "${project.projectName}".`,
  };
}

const OPERATION_HANDLERS = {
  update_profile: updateCoreProfile,
  update_job_preferences: updateJobPreferences,
  add_skill: addSkill,
  update_skill: updateSkill,
  delete_skill: deleteSkill,
  add_education: addEducation,
  update_education: updateEducation,
  delete_education: deleteEducation,
  add_experience: addExperience,
  update_experience: updateExperience,
  delete_experience: deleteExperience,
  add_project: addProject,
  update_project: updateProject,
  delete_project: deleteProject,
};

export async function applyAssistantOperations(studentId, operations = []) {
  const results = [];

  for (const operation of Array.isArray(operations) ? operations : []) {
    const handler = OPERATION_HANDLERS[operation?.operation];
    if (!handler) {
      results.push({
        operation: operation?.operation || 'unknown',
        status: 'skipped',
        message: 'Unsupported operation.',
      });
      continue;
    }

    try {
      const result = await handler(studentId, operation.match || {}, operation.payload || {});
      results.push({
        operation: operation.operation,
        ...result,
      });
    } catch (error) {
      console.error('Assistant operation failed:', operation?.operation, error);
      results.push({
        operation: operation?.operation || 'unknown',
        status: 'failed',
        message: error?.message || 'Operation failed.',
      });
    }
  }

  return results;
}
