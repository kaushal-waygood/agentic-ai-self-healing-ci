import apiInstance from '@/services/api';

export const getAllJobs = async (params: {
  page: number;
  query?: string;
  country?: string;
  city?: string;
  datePosted?: string;
  employmentType?: string;
  experience?: string;
  limit?: number;
}) => {
  const { page, limit = 10, ...filters } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Add filters to query params if they exist
  if (filters.query) queryParams.append('query', filters.query);
  if (filters.country) queryParams.append('country', filters.country);
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.datePosted) queryParams.append('datePosted', filters.datePosted);
  if (filters.employmentType)
    queryParams.append('employmentType', filters.employmentType);
  if (filters.experience) queryParams.append('experience', filters.experience);

  const response = await apiInstance.get(`/jobs?${queryParams.toString()}`);
  return response;
};

export const getJobBySlug = async (slug: string) => {
  const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
  return response;
};

export const postJobMannalByOrgAdmin = async (data: any) => {
  const response = await apiInstance.post('/jobs/mannual', data);
  return response;
};

export const getAllJobsByOrgAdmin = async () => {
  const response = await apiInstance.get(`organization/get-job`);
  return response;
};

export const updateJobStatus = async (id: string) => {
  const response = await apiInstance.patch(`/jobs/status/${id}`);
  return response;
};
