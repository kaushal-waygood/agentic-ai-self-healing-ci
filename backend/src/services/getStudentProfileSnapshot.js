import { Student } from '../models/students/student.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';

export async function getStudentProfileSnapshot(studentId) {
  const [student, education, experience, skills, projects] = await Promise.all([
    Student.findById(studentId).lean(),
    StudentEducation.find({ student: studentId }).sort('order').lean(),
    StudentExperience.find({ student: studentId }).sort('order').lean(),
    StudentSkill.find({ student: studentId }).sort('order').lean(),
    StudentProject.find({ student: studentId }).sort('order').lean(),
  ]);

  if (!student) return null;

  return {
    ...student,
    education,
    experience,
    skills,
    projects,
  };
}
