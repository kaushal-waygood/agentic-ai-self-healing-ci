import mongoose from 'mongoose';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { Job } from '../models/jobs.model.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { buildEffectiveStudentProfile } from '../utils/profileHydration.js';
import {
  buildApplicationData,
  processAgentDiscovery,
} from '../worker/autopilotWorker.js';
import { processTailoredApplication } from './tailored.autopilot.js';

const buildTailoredViewUrl = (applicationId) =>
  applicationId ? `/dashboard/my-docs/application/${applicationId}` : null;

export const initiateTailoredJobGeneration = async ({
  studentId,
  agentIdParam,
  jobId,
  io,
}) => {
  // 1. Validations
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return {
      status: 400,
      success: false,
      message: 'Invalid student ID',
      errorCode: 'INVALID_STUDENT_ID',
    };
  }
  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    return {
      status: 400,
      success: false,
      message: 'Invalid job ID',
      errorCode: 'INVALID_JOB_ID',
    };
  }

  // 2. Fetch Agent
  const isMongoId =
    mongoose.Types.ObjectId.isValid(agentIdParam) &&
    String(agentIdParam).length === 24;
  const agent = await StudentAgent.findOne(
    isMongoId
      ? { _id: agentIdParam, student: studentId }
      : { agentId: agentIdParam, student: studentId },
  ).lean();

  if (!agent) {
    return {
      status: 404,
      success: false,
      message: 'Agent not found',
      errorCode: 'AGENT_NOT_FOUND',
    };
  }

  // 3. Fetch Job
  const job = await Job.findById(jobId).lean();
  if (!job) {
    return {
      status: 404,
      success: false,
      message: 'Job not found',
      errorCode: 'JOB_NOT_FOUND',
    };
  }

  // 4. Check for existing drafts
  const existingDraft = await StudentTailoredApplication.findOne({
    student: studentId,
    jobId: job._id,
  });

  if (existingDraft) {
    const isCompleted = existingDraft.status === 'completed';
    return {
      status: isCompleted ? 200 : 202,
      success: true,
      message: isCompleted
        ? 'Tailored docs already generated'
        : 'Generation already in progress',
      data: {
        applicationId: existingDraft._id,
        jobTitle: job.title,
        company: job.company,
        tailoredStatus: existingDraft.status,
        tailoredGenerated: isCompleted,
        tailoredViewUrl: buildTailoredViewUrl(existingDraft._id),
      },
    };
  }

  // 5. Prepare Data
  const studentProfile = await getStudentProfileSnapshot(studentId);
  if (!studentProfile) {
    return {
      status: 404,
      success: false,
      message: 'Student profile not found',
      errorCode: 'PROFILE_NOT_FOUND',
    };
  }

  const effectiveStudent = buildEffectiveStudentProfile(studentProfile, agent);
  const applicationData = buildApplicationData(job, effectiveStudent, '');

  // 6. Create Application Record
  const application = await StudentTailoredApplication.create({
    student: studentId,
    jobId: job._id,
    jobTitle: job.title,
    companyName: job.company,
    jobDescription: job.description,
    useProfile: true,
    status: 'pending',
    flag: 'agent',
  });

  // 7. Trigger Async Processing (Fire and Forget)
  processTailoredApplication(
    studentId,
    application._id,
    applicationData,
    io,
    null,
    {
      modelType: 'StudentTailoredApplication',
      statusMap: { success: 'completed', failed: 'failed' },
    },
  ).catch((err) =>
    console.error(`[TailoredUtil] Failed for job ${jobId}:`, err),
  );

  return {
    status: 202,
    success: true,
    message: 'Tailored doc generation started',
    data: {
      applicationId: application._id,
      jobTitle: job.title,
      company: job.company,
      tailoredStatus: application.status,
      tailoredGenerated: false,
      tailoredViewUrl: buildTailoredViewUrl(application._id),
    },
  };
};
