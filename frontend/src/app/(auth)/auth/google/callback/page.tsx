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
import { Loader } from '@/components/Loader';

const GoogleAuthCallback = () => {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const isNew = searchParams.get('new');

    if (token) {
      try {
        dispatch(googleLoginSuccess({ token }));
        dispatch(getGetMeRequest(token));

        if (isNew === 'true') {
          navigate.push('/dashboard/onboarding-tour');
        } else {
          navigate.push('/dashboard');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate.push('/login?error=invalid_token');
      }
    } else {
      navigate.push('/login?error=no_token');
    }
  }, [dispatch, navigate, searchParams]);

  return <Loader />;
};

export default GoogleAuthCallback;
