// File: app/components/GoogleSignInButton.js

'use client';

import { RootState } from '@/redux/rootReducer';
import apiInstance from '@/services/api';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default function GoogleSignInButton() {
  const googleButton = useRef(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleGoogleSignIn = async (response) => {
    try {
      const res = await apiInstance.post(`/auth/google/${user._id}`, {
        token: response.credential,
      });

      const data = await res.data;

      // Store the session token from your backend (e.g., in localStorage)
      localStorage.setItem('app_token', data.token);

      // Optionally, redirect the user or update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  useEffect(() => {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });

      google.accounts.id.renderButton(
        googleButton.current, // The DOM element to render the button in
        { theme: 'outline', size: 'large' }, // Customization options
      );
    }
  }, []);

  return <div ref={googleButton}></div>;
}
