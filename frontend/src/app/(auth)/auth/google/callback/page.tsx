'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  getGetMeRequest,
  googleLoginSuccess,
} from '@/redux/reducers/authReducer';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/Loader';
import { persistor } from '@/redux/store';

const GoogleAuthCallback = () => {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const isNew = searchParams.get('new');

    if (token) {
      const runAuthFlow = async () => {
        try {
          dispatch(
            googleLoginSuccess({
              token,
            }),
          );
          // Flush persist so token is in localStorage before dashboard requests run
          await persistor.flush();
          dispatch(getGetMeRequest(token));

          if (isNew === 'true') {
            navigate.push('/dashboard/onboarding-tour');
          } else {
            navigate.push('/dashboard');
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
          navigate.push('/login?error=invalid_token');
        }
      };
      runAuthFlow();
    } else if (error) {
      navigate.push(`/login?error=${error}`);
    } else {
      navigate.push('/login?error=no_token');
    }
  }, [dispatch, navigate, searchParams]);

  return <Loader />;
};

export default GoogleAuthCallback;
