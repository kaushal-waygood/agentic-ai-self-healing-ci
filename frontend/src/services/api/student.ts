import apiInstance from '../api';

export const getStudentDetails = async () => {
  const response = await apiInstance.get('/students/details');
  return response;
};

export const addEducation = async (data: any) => {
  const response = await apiInstance.post('/students/education/add', data);
  return response;
};

export const removeEducation = async (data: any) => {
  const response = await apiInstance.post('/students/education/remove', data);
  return response;
};

export const addExperience = async (data: any) => {
  const response = await apiInstance.post('/students/experience/add', data);
  return response;
};

export const removeExperience = async (data: any) => {
  const response = await apiInstance.post('/students/experience/remove', data);
  return response;
};

// export const addProject = async (data: any) => {
//   const response = await apiInstance.post('/students/project/add', data);
//   return response;
// };

// export const removeProject = async (data: any) => {
//   const response = await apiInstance.post('/students/project/remove', data);
//   return response;
// };

export const addSkill = async (data: any) => {
  const response = await apiInstance.post('/students/skill/add', data);
  return response;
};

export const removeSkill = async (data: any) => {
  const response = await apiInstance.post('/students/skill/remove', data);
  return response;
};
