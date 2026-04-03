import mongoose from 'mongoose';

import {
  Student,
  StudentEducation,
  StudentExperience,
  StudentSkill,
  StudentProject,
  StudentCV,
  StudentCL,
  StudentApplication,
  StudentTailoredApplication,
  StudentHtmlCV,
  StudentCoverLetter,
} from '../models/index.js';
import { AssistantFoundJob } from '../models/AssistantFoundJob.js';

export async function deleteStudentCascade(studentId) {
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await Promise.all([
      StudentEducation.deleteMany({ student: studentId }).session(session),
      StudentExperience.deleteMany({ student: studentId }).session(session),
      StudentSkill.deleteMany({ student: studentId }).session(session),
      StudentProject.deleteMany({ student: studentId }).session(session),
      StudentCV.deleteMany({ student: studentId }).session(session),
      StudentCL.deleteMany({ student: studentId }).session(session),
      StudentApplication.deleteMany({ student: studentId }).session(session),
      StudentTailoredApplication.deleteMany({ student: studentId }).session(
        session,
      ),
      StudentHtmlCV.deleteMany({ student: studentId }).session(session),
      StudentCoverLetter.deleteMany({ student: studentId }).session(session),
      AssistantFoundJob.deleteMany({ student: studentId }).session(session),
    ]);

    await Student.deleteOne({ _id: studentId }).session(session);
  });

  session.endSession();
}
