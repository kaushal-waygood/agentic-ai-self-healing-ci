import apiInstance from '../api';

export const createAutoPilot = async (payload: { title: string }) => {
  const response = await apiInstance.post('/pilotagent/create', payload);
  return response;
};

export const getAllAutopilot = async () => {
  const response = await apiInstance.get('/pilotagent/get');
  return response;
};

export const getAgentJobs = async (agentId: string, limit = 20) => {
  const response = await apiInstance.get(`/pilotagent/get/${agentId}/jobs`, {
    params: { limit },
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
