import apiInstance from '../api';

export const addOrganizationMember = async (payload: {
  fullName: string;
  email: string;
  role: string;
  department: string;
  course: string;
}) => {
  const response = await apiInstance.post(
    '/organization/member/request',
    payload,
  );
  return response;
};

export const getOrganizationMembers = async () => {
  const response = await apiInstance.get(`/organization/members/all`);
  return response;
};

export const editOrganizationMember = async (id: string) => {
  const { id: _id, updates } = id;
  const response = await apiInstance.patch(
    `organization/members/${_id}/edit`,
    updates,
  );
  return response;
};

export const deleteOrganizationMember = async (id: string) => {
  const response = await apiInstance.delete(
    `/organization/members/${id}/remove`,
  );
  return response;
};

export const filterOrganizationMembers = async (queryString: string) => {
  return await apiInstance.get(`/organization/members/filter?${queryString}`);
};

export const getAllOrgMembersUniqueDepartments = async () => {
  const response = await apiInstance.get(
    '/organization/members/get-unique-departments',
  );
  return response;
};

export const getAllOrgMembersUniqueCourses = async () => {
  const response = await apiInstance.get(
    '/organization/members/get-unique-courses',
  );
  return response;
};
