import apiInstance from '../api';

export const createAutoPilot = async (payload: { title: string }) => {
  const response = await apiInstance.post('/pilotagent/create', payload);
  return response;
};

export const getAllAutopilot = async () => {
  const response = await apiInstance.get('/pilotagent/get');
  return response;
};
