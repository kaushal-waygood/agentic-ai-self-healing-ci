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

export const updateEducation = async (index: any, data: any) => {
  const response = await apiInstance.patch(
    `/students/education/update/${index}`,
    data,
  );
  return response;
};

export const addExperience = async (data: any) => {
  const response = await apiInstance.post('/students/experience/add', data);
  return response;
};

export const removeExperience = async (data: any) => {
  const response = await apiInstance.delete(
    '/students/experience/remove/' + data,
  );
  return response;
};

export const updateExperience = async (index: any, data: any) => {
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

export const updateProject = async (index: any, data: any) => {
  const response = await apiInstance.patch(
    `/students/project/update/${index}`,
    data,
  );
  return response;
};

export const removeProject = async (index: any) => {
  const response = await apiInstance.delete(
    '/students/project/remove/' + index,
  );
  return response;
};

export const getAllProjects = async () => {
  const response = await apiInstance.get('/students/projects');
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

export const updateSkill = async (index: string, data: any) => {
  console.log('data', data);
  const response = await apiInstance.patch(`/students/skill/update/${index}`, {
    level: data.level,
  });
  return response;
};

export const updateJobPreference = async (data: any) => {
  const response = await apiInstance.post('/students/job-role/update', {
    jobRole: data,
  });
  return response;
};

export const recommendProfileJob = async () => {
  const response = await apiInstance.get('/students/prefered-job/get');
  return response;
};

export const getResumeDetailsByResume = async (data: any) => {
  const response = await apiInstance.post('/students/resume/extract', data);
  return response;
};

export const updateJobPrefered = async (data: any) => {
  const response = await apiInstance.post('/students/prefered-job/add', {
    data,
  });
  return response;
};

export const getAllSavedJobs = async () => {
  const response = await apiInstance.get('/students/jobs/saved');
  return response;
};

export const saveJob = async (data: any) => {
  console.log('data', data);
  const response = await apiInstance.post('/students/jobs/saved', {
    jobId: data,
  });
  return response;
};

export const visitedJobs = async (data: any) => {
  console.log('data', data);
  const response = await apiInstance.get(`/students/jobs/visited/${data}`);
  return response;
};

export const viewedJobs = async (data: any) => {
  console.log('data', data);
  const response = await apiInstance.get(`/students/jobs/viewed/${data}`);
  return response;
};

export const isVisited = async (data: any) => {
  console.log('data', data);
  const response = await apiInstance.get(`/students/jobs/is-visited/${data}`);
  return response;
};
