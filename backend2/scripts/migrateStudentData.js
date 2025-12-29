import mongoose from 'mongoose';

import { Student } from './src/models/students/student.model.js';
import { StudentEducation } from './src/models/students/studentEducation.model.js';
import { StudentExperience } from './src/models/students/studentExperience.model.js';
import { StudentSkill } from './src/models/students/studentSkill.model.js';
import { StudentProject } from './src/models/students/studentProject.model.js';
import { StudentCV } from './src/models/students/studentCV.model.js';
import { StudentCL } from './src/models/students/studentCL.model.js';
import { StudentApplication } from './src/models/student/studentApplication.model.js';
import { StudentTailoredApplication } from './src/models/student/studentTailoredApplication.model.js';
import { StudentHtmlCV } from './src/models/student/studentHtmlCV.model.js';
import { StudentCoverLetter } from './src/models/student/studentCoverLetter.model.js';

await mongoose.connect(process.env.MONGO_URI);

const students = await Student.find({});

for (const student of students) {
  const sid = student._id;

  await StudentEducation.insertMany(
    (student.education || []).map((e) => ({ ...e, student: sid })),
  );

  await StudentExperience.insertMany(
    (student.experience || []).map((e) => ({ ...e, student: sid })),
  );

  await StudentSkill.insertMany(
    (student.skills || []).map((s) => ({ ...s, student: sid })),
  );

  await StudentProject.insertMany(
    (student.projects || []).map((p) => ({ ...p, student: sid })),
  );

  await StudentCV.insertMany(
    (student.cvs || []).map((c) => ({ ...c, student: sid })),
  );

  await StudentCL.insertMany(
    (student.cls || []).map((c) => ({ ...c, student: sid })),
  );

  await StudentApplication.insertMany(
    (student.applications || []).map((a) => ({ ...a, student: sid })),
  );

  await StudentTailoredApplication.insertMany(
    (student.tailoredApplications || []).map((a) => ({ ...a, student: sid })),
  );

  await StudentHtmlCV.insertMany(
    (student.htmlCV || []).map((c) => ({ ...c, student: sid })),
  );

  await StudentCoverLetter.insertMany(
    (student.coverLetter || []).map((c) => ({ ...c, student: sid })),
  );

  // OPTIONAL cleanup after verification
  student.education = [];
  student.experience = [];
  student.skills = [];
  student.projects = [];
  student.cvs = [];
  student.cls = [];
  student.applications = [];
  student.tailoredApplications = [];
  student.htmlCV = [];
  student.coverLetter = [];

  await student.save();
}

console.log('Migration completed');
process.exit(0);
