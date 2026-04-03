import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Student } from '../models/students/student.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';
import { StudentCV } from '../models/students/studentCV.model.js';
import { StudentCL } from '../models/students/studentCL.model.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { StudentHtmlCV } from '../models/students/studentHtmlCV.model.js';
import { StudentCoverLetter } from '../models/students/studentCoverLetter.model.js';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { AgentFoundJob } from '../models/AgentFoundJob.js';
import { AssistantFoundJob } from '../models/AssistantFoundJob.js';
import { AppliedJob } from '../models/AppliedJob.js';
import { JobApplication } from '../models/JobApplication.js';
import { RecruiterEmailSent } from '../models/RecruiterEmailSent.model.js';
import { Notification } from '../models/notification.model.js';
import { Feedback } from '../models/feedback.model.js';
import { LoginHistory } from '../models/analyics/loginHistory.model.js';
import { JobInteraction } from '../models/jobInteraction.model.js';
import { Usage } from '../models/Usage.model.js';
import { Notify } from '../models/notify.js';
import { UserEvent } from '../models/analyics/UserEvent.model.js';
import { Session } from '../models/analyics/session.model.js';
import { UserAnalytics } from '../models/analyics/userAnalytics.model.js';
import { CouponRedemption } from '../models/couponRedemption.model.js';
import { Purchase } from '../models/Purchase.js';
import { OrganizationMember } from '../models/OrganizationMembers.model.js';
import { BringZobs } from '../models/BringZobs.model.js';
import { GeminiUsage } from '../models/GeminiUsage.js';

/**
 * Deletes a user and all associated data from the database.
 * Includes: User, Student profile, CVs, cover letters, applications, analytics, etc.
 * @param {mongoose.Types.ObjectId} userId - The user ID to delete
 * @returns {Promise<{ deleted: boolean; message: string }>}
 */
export async function deleteUserCascade(userId) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const studentId = userId; // Student._id === User._id for students

      // 1. Delete all student-related data (CVs, cover letters, applications, etc.)
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
        StudentAgent.deleteMany({ student: studentId }).session(session),
        AgentFoundJob.deleteMany({ student: studentId }).session(session),
        AssistantFoundJob.deleteMany({ student: studentId }).session(session),
        AppliedJob.deleteMany({ student: studentId }).session(session),
        JobApplication.deleteMany({ applicant: studentId }).session(session),
      ]);

      await Student.deleteOne({ _id: studentId }).session(session);

      // 2. Delete user-related data
      await Promise.all([
        RecruiterEmailSent.deleteMany({
          $or: [{ user: userId }, { student: studentId }],
        }).session(session),
        Notification.deleteMany({ userId }).session(session),
        Feedback.deleteMany({ userId }).session(session),
        LoginHistory.deleteMany({ userId }).session(session),
        JobInteraction.deleteMany({ user: userId }).session(session),
        Usage.deleteMany({ user: userId }).session(session),
        Notify.deleteMany({ name: userId }).session(session),
        UserEvent.deleteMany({ userId }).session(session),
        Session.deleteMany({ userId }).session(session),
        UserAnalytics.deleteMany({ userId }).session(session),
        CouponRedemption.deleteMany({ userId }).session(session),
        Purchase.deleteMany({ user: userId }).session(session),
        OrganizationMember.deleteMany({ userId }).session(session),
        BringZobs.deleteMany({ user: userId }).session(session),
        GeminiUsage.deleteMany({ userId }).session(session),
      ]);

      // 3. Remove user from referrer's referredUsers
      await User.updateMany(
        { referredUsers: userId },
        { $pull: { referredUsers: userId }, $inc: { referralCount: -1 } },
      ).session(session);

      // 4. Delete the user
      const result = await User.deleteOne({ _id: userId }).session(session);

      if (result.deletedCount === 0) {
        throw new Error('User not found');
      }
    });

    return { deleted: true, message: 'User and all associated data deleted successfully' };
  } finally {
    await session.endSession();
  }
}
