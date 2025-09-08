// File: app/components/GoogleSignInButton.js

'use client';

import { useEffect, useRef } from 'react';

// Make sure to declare the global google object
// to avoid TypeScript errors.
/* global google */

export default function GoogleSignInButton() {
  const googleButton = useRef(null);

  // This is the function that will be called by Google
  // after the user has successfully signed in.
  const handleGoogleSignIn = async (response) => {
    console.log('ID TOKEN:', response.credential);

    // TODO: Send this to your Node.js backend
    try {
      const res = await fetch('http://localhost:8000/api/auth/google', {
        // Your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      console.log('Response from backend:', data);

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
