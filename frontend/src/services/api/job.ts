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

export const searchJobs = async (params: {
  page: number;
  query?: string;
  country?: string;
  city?: string;
  state: string;
  datePosted?: string;
  employmentType?: string;
  experience?: string;
  limit?: number;
}) => {
  const { page, limit = 10, query, ...filters } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // The main search term
  if (query) queryParams.append('q', query);

  // Add other filters if they exist
  if (filters.country) queryParams.append('country', filters.country);
  if (filters.state) queryParams.append('state', filters.state);
  if (filters.datePosted) queryParams.append('datePosted', filters.datePosted);
  if (filters.employmentType)
    queryParams.append('employmentType', filters.employmentType);
  if (filters.experience) queryParams.append('experience', filters.experience);

  // Note the endpoint is /jobs/search
  const response = await apiInstance.get(
    `/jobs/search?${queryParams.toString()}`,
  );
  return response;
};

export const getRecommendJobs = async () => {
  const response = await apiInstance.get('/students/jobs/recommended');
  return response;
};
