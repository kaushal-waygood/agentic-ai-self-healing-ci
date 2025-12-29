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

  const hasExperience = Array.isArray(experiences) && experiences.length > 0;
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  if (!hasExperience && !hasProjects)
    reasons.push('Experience or projects required');

  console.log(reasons);
  console.log(reasons.length === 0);

  return {
    complete: reasons.length === 0,
    reasons,
  };
}
