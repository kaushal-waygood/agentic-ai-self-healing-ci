import apiInstance from '../api';

export const generateCVByJobDescription = async (data: any) => {
  const response = await apiInstance.post('/students/resume/generate/jd', data);
  return response;
};

export const generateCVByJobId = async (data: any) => {
  const response = await apiInstance.post(
    '/students/resume/generate/jobid',
    data,
  );
  return response;
};

export const generateCVByJobTitle = async (data: any) => {
  const response = await apiInstance.post(
    '/students/resume/generate/jobtitle',
    data,
  );
  return response;
};

export const savedStudentResume = async () => {
  const response = await apiInstance.get('/students/resume/saved');
  return response;
};

export const savedStudentCoverLetter = async () => {
  const response = await apiInstance.get('/students/letter/saved');
  return response;
};
