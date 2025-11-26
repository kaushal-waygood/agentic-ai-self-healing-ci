import apiInstance from '../api';

export const getCredit = async () => {
  const response = await apiInstance.get(`/students/credits`);

  return response;
};
