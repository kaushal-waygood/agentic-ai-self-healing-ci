'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  getGetMeRequest,
  getProfileRequest,
  googleLoginSuccess,
} from '@/redux/reducers/authReducer'; // Adjust path if needed
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const GoogleAuthCallback = () => {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      try {
        localStorage.setItem('accessToken', token);

        dispatch(googleLoginSuccess(token));
        dispatch(getGetMeRequest());

        navigate.push('/dashboard/onboarding-tour');
      } catch (error) {
        console.error('Invalid token:', error);
        navigate.push('/login?error=invalid_token');
      }
    } else {
      // No token found, redirect to login
      navigate.push('/login?error=no_token');
    }
  }, [dispatch, navigate, searchParams]);

  // Render a loading indicator while processing
  return (
    <div className="flex items-center flex-col justify-center min-h-screen">
      <div>
        <Image
          src="/logo.png"
          alt="zobsai logo"
          width={100}
          height={100}
          className="w-10 h-10 animate-bounce"
        />
      </div>
      <div className="text-lg">LOADING...</div>
    </div>
  );
};

export default GoogleAuthCallback;
