import apiInstance from '../api';

type AgentJobsOptions = {
  page?: number;
  limit?: number;
  feedback?: string;
};

export const createAutoPilot = async (payload: { title: string }) => {
  const response = await apiInstance.post('/pilotagent/create', payload);
  return response;
};

export const getAllAutopilot = async () => {
  const response = await apiInstance.get('/pilotagent/get');
  return response;
};

export const getSingleAutopilot = async (agentId: string) => {
  const response = await apiInstance.get(`/pilotagent/get/${agentId}`);
  return response;
};

export const getAgentJobs = async (
  agentId: string,
  limitOrOptions: number | AgentJobsOptions = 20,
  feedback?: string,
) => {
  const options =
    typeof limitOrOptions === 'number'
      ? { limit: limitOrOptions, feedback }
      : limitOrOptions;
  const params: Record<string, string | number> = {
    limit: options.limit ?? 20,
    page: options.page ?? 1,
  };
  if (options.feedback?.trim()) params.feedback = options.feedback.trim();
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
  limitOrOptions: number | { limit?: number; page?: number } = 30,
) => {
  const options =
    typeof limitOrOptions === 'number'
      ? { limit: limitOrOptions, page: 1 }
      : limitOrOptions;
  const response = await apiInstance.post(
    `/pilotagent/get/${agentId}/jobs/${jobId}/find-other`,
    {},
    {
      params: {
        limit: options.limit ?? 30,
        page: options.page ?? 1,
      },
    },
  );
  return response;
};
