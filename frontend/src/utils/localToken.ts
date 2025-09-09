'use client';

export const getLocalToken = () => {
  return localStorage.getItem('accessToken');
};
