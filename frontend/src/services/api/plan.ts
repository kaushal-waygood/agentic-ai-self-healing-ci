import apiInstance from '../api';

export const getPlanDetails = async () => {
  const response = await apiInstance.get('/plan/get-user-plan-type');
  return response.data;
};
