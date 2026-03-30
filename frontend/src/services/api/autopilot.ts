import apiInstance from '../api';

export const createAutoPilot = async (payload: { title: string }) => {
  const response = await apiInstance.post('/pilotagent/create', payload);
  return response;
};

export const getAllAutopilot = async () => {
  const response = await apiInstance.get('/pilotagent/get');
  return response;
};

export const getAgentJobs = async (
  agentId: string,
  limit = 20,
  feedback?: string,
) => {
  const params: Record<string, string | number> = { limit };
  if (feedback?.trim()) params.feedback = feedback.trim();
  const response = await apiInstance.get(`/pilotagent/get/${agentId}/jobs`, {
    params,
  });
  return response;
};

export const startAgentJobTailoredGeneration = async (
  agentId: string,
  jobId: string,
) => {
  const response = await apiInstance.post(
    `/pilotagent/get/${agentId}/jobs/${jobId}/generate`,
  );
  return response;
};

export const replaceAgentJob = async (
  agentId: string,
  jobId: string,
  limit = 30,
) => {
  const response = await apiInstance.post(
    `/pilotagent/get/${agentId}/jobs/${jobId}/find-other`,
    {},
    { params: { limit } },
  );
  return response;
};
