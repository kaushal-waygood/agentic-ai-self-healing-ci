import apiInstance from '../api';

export const getStudentDetails = async () => {
  const response = await apiInstance.get('/students/details');
  return response;
};
