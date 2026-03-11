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

export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await apiInstance.patch('/user/me/password/change', payload);
  return response;
};

export const sendEmailPermit = async (payload: {
  email: String;
  recieverEmail: 'arsalan@helpstudyabroad.com';
  resume: String;
  coverLetter: String;
  jobTitle: String;
  emailDraft: String;
}) => {
  const response = await apiInstance.post('/user/send-email', {
    senderEmail: payload.email,
    recieverEmail: payload.recieverEmail,
    subject: payload.jobTitle,
    bodyHtml: payload.emailDraft,
    htmlResume: payload.resume,
    htmlCoverLetter: payload.coverLetter,
  });
  return response;
};

export const verifyEmail = async (data: any) => {
  const { storedEmail, verificationCode } = data;
  const response = await apiInstance.post('/user/verify', {
    email: storedEmail,
    otp: verificationCode,
  });
  return response;
};

export const getSentRecruiterEmails = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await apiInstance.get('/user/sent-recruiter-emails', {
    params,
  });
  return response.data;
};

export const getMe = async (token: string) => {
  const response = await apiInstance.get('/user/getme', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const loginHistory = async (payload: any) => {
  const response = await apiInstance.post('/analytics/login-history', payload);
  return response;
};

export const deleteAccount = async () => {
  const response = await apiInstance.delete('/user/me');
  return response;
};
