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
  const response = await apiInstance.post(`/students/education/remove/${data}`);
  return response;
};

export const updateEducation = async (data: any, eduData: any) => {
  const response = await apiInstance.patch(
    `/students/education/update/${data}`,
    eduData,
  );
  return response;
};

export const addExperience = async (data: any) => {
  const response = await apiInstance.post('/students/experience/add', data);
  return response;
};

export const removeExperience = async (data: any) => {
  console.log('data', data);
  const response = await apiInstance.delete(
    '/students/experience/remove/' + data,
  );
  return response;
};

export const updateExperience = async (data: any, index: any) => {
  console.log('data', data, 'index', data._id);
  const response = await apiInstance.patch(
    `/students/experience/update/${index}`,
    data,
  );
  return response;
};

export const addProject = async (data: any) => {
  const response = await apiInstance.post('/students/project/add', data);
  return response;
};

export const removeProject = async (data: any) => {
  const response = await apiInstance.post('/students/project/remove', data);
  return response;
};

export const addSkill = async (data: any) => {
  const response = await apiInstance.post('/students/skill/add', data);
  return response;
};

export const removeSkill = async (data: any) => {
  const response = await apiInstance.delete(`/students/skill/remove/${data}`);
  return response;
};

export const updateSkill = async (data: any) => {
  const response = await apiInstance.patch(
    `/students/skill/update/${data.index}`,
    { level: data.level },
  );
  return response;
};

export const updateJobPreference = async (data: any) => {
  const response = await apiInstance.post('/students/prefered-job/add', data);
  return response;
};

export const recommendProfileJob = async () => {
  console.log('recommendProfileJob');
  const response = await apiInstance.get('/students/prefered-job/get');
  console.log('response', response);
  return response;
};
