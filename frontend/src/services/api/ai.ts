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

export const deleteSavedResume = async (cvId: string) => {
  const response = await apiInstance.delete(`/students/resume/saved/${cvId}`);
  return response;
};

export const deleteSavedCoverLetter = async (clId: string) => {
  const response = await apiInstance.delete(`/students/letter/saved/${clId}`);
  return response;
};

export const renameSavedResume = async (cvId: string, newTitle: string) => {
  const response = await apiInstance.patch(
    `/students/resume/saved/${cvId}/rename`,
    {
      title: newTitle,
    },
  );
  return response;
};

export const renameSavedCoverLetter = async (
  clId: string,
  newTitle: string,
) => {
  const response = await apiInstance.patch(
    `/students/letter/saved/${clId}/rename`,
    {
      title: newTitle,
    },
  );
  return response;
};

export const fetchDocumentCounts = async () => {
  const response = await apiInstance.get('/students/documents/count');
  return response;
};

export const fetchCVs = async () => {
  const response = await apiInstance.get('/students/cvs');
  return response;
};
export const fetchCLs = async () => {
  const response = await apiInstance.get('/students/cls');
  return response;
};
export const fetchTailoredApps = async () => {
  const response = await apiInstance.get('/students/tailored-applications');
  return response;
};
