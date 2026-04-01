import mongoose from 'mongoose';
import { StudentAgent } from '../models/students/studentAgent.model.js';

export const buildTailoredViewUrl = (applicationId) =>
  applicationId ? `/dashboard/my-docs/application/${applicationId}` : null;

export const isMongoObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) && String(value).length === 24;

export const findAgentForStudent = async (studentId, agentIdParam) =>
  StudentAgent.findOne(
    isMongoObjectId(agentIdParam)
      ? { _id: agentIdParam, student: studentId }
      : { agentId: agentIdParam, student: studentId },
  ).lean();

export const buildTailoredGenerationData = ({
  applicationId,
  job,
  tailoredStatus,
  tailoredGenerated,
}) => ({
  applicationId,
  jobTitle: job.title,
  company: job.company,
  tailoredStatus,
  tailoredGenerated,
  tailoredViewUrl: buildTailoredViewUrl(applicationId),
});

export const getExistingTailoredDraftResponse = (existingDraft, job) => {
  if (existingDraft.status === 'completed') {
    return {
      statusCode: 200,
      body: {
        success: true,
        message: 'Tailored docs already generated for this job',
        data: buildTailoredGenerationData({
          applicationId: existingDraft._id,
          job,
          tailoredStatus: existingDraft.status,
          tailoredGenerated: true,
        }),
      },
    };
  }

  return {
    statusCode: 202,
    body: {
      success: true,
      message: 'Generation already in progress for this job',
      data: buildTailoredGenerationData({
        applicationId: existingDraft._id,
        job,
        tailoredStatus: existingDraft.status,
        tailoredGenerated: false,
      }),
    },
  };
};
