import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import your models
import { Student } from '../src/models/students/student.model.js';
import { StudentEducation } from '../src/models/students/studentEducation.model.js';
import { StudentExperience } from '../src/models/students/studentExperience.model.js';
import { StudentSkill } from '../src/models/students/studentSkill.model.js';
import { StudentProject } from '../src/models/students/studentProject.model.js';
import { StudentCV } from '../src/models/students/studentCV.model.js';
import { StudentCL } from '../src/models/students/studentCL.model.js';
import { StudentApplication } from '../src/models/students/studentApplication.model.js';
import { StudentTailoredApplication } from '../src/models/students/studentTailoredApplication.model.js';
import { StudentHtmlCV } from '../src/models/students/studentHtmlCV.model.js';
import { StudentCoverLetter } from '../src/models/students/studentCoverLetter.model.js';

dotenv.config();

// 1. Helper function to ignore "Duplicate Key" errors
async function safeInsert(Model, data) {
  if (!data || data.length === 0) return;
  try {
    // ordered: false tells Mongo to keep processing even if one fails
    await Model.insertMany(data, { ordered: false });
  } catch (error) {
    // Code 11000 = Duplicate Key. We ignore it.
    // If it's any OTHER error, we want to know.
    if (
      error.code !== 11000 &&
      !error.writeErrors?.every((e) => e.code === 11000)
    ) {
      console.error(
        `❌ Error inserting into ${Model.modelName}:`,
        error.message,
      );
    }
  }
}

console.log('🔌 Connecting to MongoDB...');
await mongoose.connect(
  'mongodb+srv://arsalan:n3nq9IZZJsOOC5Cl@careerpilot.zysihya.mongodb.net/careerpilot?retryWrites=true&w=majority&appName=careerpilot',
); // Make sure your .env is loaded

console.log('🚀 Starting Migration...');

// Ensure we get all fields, even those not in strict schema
const students = await Student.find({}, {}, { strict: false });

let count = 0;
for (const student of students) {
  const sid = student._id;
  count++;

  // Show progress every 10 students
  if (count % 10 === 0) console.log(`Processing student #${count}...`);

  await safeInsert(
    StudentEducation,
    (student.education || []).map((e) => ({ ...e, student: sid })),
  );

  await safeInsert(
    StudentExperience,
    (student.experience || []).map((e) => ({
      ...e,
      student: sid,
      // Fix for the Freelance error you had earlier
      employmentType:
        e.employmentType === 'FREELANCE' ? 'CONTRACT' : e.employmentType,
    })),
  );

  await safeInsert(
    StudentSkill,
    (student.skills || []).map((s) => ({ ...s, student: sid })),
  );

  await safeInsert(
    StudentProject,
    (student.projects || []).map((p) => ({ ...p, student: sid })),
  );

  await safeInsert(
    StudentCV,
    (student.cvs || []).map((c) => ({ ...c, student: sid })),
  );

  await safeInsert(
    StudentCL,
    (student.cls || []).map((c) => ({ ...c, student: sid })),
  );

  await safeInsert(
    StudentApplication,
    (student.applications || []).map((a) => ({ ...a, student: sid })),
  );

  await safeInsert(
    StudentTailoredApplication,
    (student.tailoredApplications || []).map((a) => ({ ...a, student: sid })),
  );

  await safeInsert(
    StudentHtmlCV,
    (student.htmlCV || []).map((c) => ({ ...c, student: sid })),
  );

  await safeInsert(
    StudentCoverLetter,
    (student.coverLetter || []).map((c) => ({ ...c, student: sid })),
  );

  // ⚠️ DANGER ZONE: Only uncomment this when you are 100% sure migration worked.
  /*
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
  */
}

console.log('✅ Migration completed successfully!');
process.exit(0);
