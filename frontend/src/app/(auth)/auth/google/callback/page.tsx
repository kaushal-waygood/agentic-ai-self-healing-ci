'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  getGetMeRequest,
  getProfileRequest,
  googleLoginSuccess,
} from '@/redux/reducers/authReducer'; // Adjust path if needed
import { useRouter, useSearchParams } from 'next/navigation';

const GoogleAuthCallback = () => {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      try {
        // 1. Store the token in localStorage
        localStorage.setItem('accessToken', token);

        dispatch(googleLoginSuccess(token));
        dispatch(getGetMeRequest());

        // 4. Redirect to the dashboard
        navigate.push('/dashboard');
      } catch (error) {
        console.error('Invalid token:', error);
        // Redirect to login page with an error
        navigate.push('/login?error=invalid_token');
      }
    } else {
      // No token found, redirect to login
      navigate.push('/login?error=no_token');
    }
  }, [dispatch, navigate, searchParams]);

  // Render a loading indicator while processing
  return <div>Loading, please wait...</div>;
};

export default GoogleAuthCallback;
