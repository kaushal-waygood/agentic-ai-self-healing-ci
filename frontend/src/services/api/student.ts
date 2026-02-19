import apiInstance from '../api';

export const getStudentDetails = async () => {
  const response = await apiInstance.get('/students/details');
  return response;
};

/* Education */
export const getEducation = async () => {
  const response = await apiInstance.get('/students/educations');
  return response;
};

export const addEducation = async (data: any) => {
  const response = await apiInstance.post('/students/educations', data);
  return response;
};

export const removeEducation = async (data: any) => {
  const response = await apiInstance.delete(`/students/educations/${data}`);
  return response;
};

export const updateEducation = async (index: any, data: any) => {
  const response = await apiInstance.patch(`/students/educations/${index}`, {
    data,
  });
  return response;
};

/* Experience */
export const getExperience = async () => {
  const response = await apiInstance.get('/students/experiences');
  return response;
};

export const addExperience = async (data: any) => {
  const response = await apiInstance.post('/students/experiences', data);
  return response;
};

export const removeExperience = async (data: any) => {
  const response = await apiInstance.delete(`/students/experiences/${data}`);
  return response;
};

export const updateExperience = async (index: any, data: any) => {
  const response = await apiInstance.patch(`/students/experiences/${index}`, {
    data,
  });
  return response;
};

/* Projects */
export const getAllProjects = async () => {
  const response = await apiInstance.get('/students/projects');
  return response;
};

export const addProject = async (data: any) => {
  const response = await apiInstance.post('/students/projects', data);
  return response;
};

export const updateProject = async (index: any, data: any) => {
  const response = await apiInstance.patch(`/students/projects/${index}`, data);
  return response;
};

export const removeProject = async (index: any) => {
  const response = await apiInstance.delete(`/students/projects/${index}`);
  return response;
};

/* Skills */
export const getSkills = async () => {
  const response = await apiInstance.get('/students/skills');
  return response;
};

export const addSkill = async (data: any) => {
  const response = await apiInstance.post('/students/skills', data);
  return response;
};

export const removeSkill = async (data: any) => {
  const response = await apiInstance.delete(`/students/skills/${data}`);
  return response;
};

export const updateSkill = async (index: string, data: any) => {
  const response = await apiInstance.patch(`/students/skills/${index}`, {
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
  const response = await apiInstance.post('/students/jobs/saved', {
    jobId: data,
  });
  return response;
};

export const visitedJobs = async (data: any) => {
  const response = await apiInstance.get(`/students/jobs/visited/${data}`);
  return response;
};

export const viewedJobs = async (data: any) => {
  const response = await apiInstance.post(`/students/job/viewed/${data}`);
  return response;
};

export const isVisited = async (data: any) => {
  const response = await apiInstance.get(`/students/jobs/is-visited/${data}`);
  return response;
};

export const studentEvents = async (data: any) => {
  const response = await apiInstance.post('/students/jobs/events', data);
  return response;
};

export const getStudentEvent = async (data: any) => {
  const response = await apiInstance.get(
    `/students/jobs/events?type=${data.type}`,
  );
  return response;
};
