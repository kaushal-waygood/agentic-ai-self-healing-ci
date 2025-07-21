import apiInstance from '../api';

export const login = async (payload: { email: string; password: string }) => {
  const response = await apiInstance.post('/user/signin', payload);
  return response;
};

export const signup = async (payload: {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  accountType: string;
  jobPreference: string;
  organizationName: string;
  referralCode: string;
}) => {
  const response = await apiInstance.post('/user/signup', payload);
  return response;
};

export const logout = async () => {
  const response = await apiInstance.get('/user/signout');
  return response;
};

export const getProfile = async () => {
  const response = await apiInstance.get('/user/me');
  return response;
};
