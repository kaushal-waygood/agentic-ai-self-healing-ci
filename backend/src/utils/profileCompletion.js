import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';

export async function checkProfileCompletion(student) {
  if (!student) return { complete: false, reasons: ['Student not found'] };

  const reasons = [];

  if (!student.fullName) reasons.push('Full name missing');
  if (!student.email) reasons.push('Email missing');
  if (!student.jobRole) reasons.push('Job role missing');
  if (!student.location) reasons.push('Location missing');

  const skills = await StudentSkill.find({ student: student._id });
  const educations = await StudentEducation.find({ student: student._id });
  const experiences = await StudentExperience.find({ student: student._id });
  const projects = await StudentProject.find({ student: student._id });

  if (!Array.isArray(skills) || skills.length === 0)
    reasons.push('At least one skill required');

  if (!Array.isArray(educations) || educations.length === 0)
    reasons.push('Education details required');

  if (!Array.isArray(experiences) || experiences.length === 0)
    reasons.push('Work experience required');

  if (!Array.isArray(projects) || projects.length === 0)
    reasons.push('Projects required');

  if (
    !student.jobPreferences?.preferredCountries?.length > 0 ||
    !student.jobPreferences?.preferredCities?.length > 0 ||
    !student.jobPreferences?.mustHaveSkills?.length > 0
  )
    reasons.push('Job preferences incomplete');

  console.log('reasons', reasons);

  return {
    complete: reasons.length === 0,
    reasons,
  };
}
