'use client';
import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming ShadCN UI component

const GoogleLoginButton = () => {
  const handleLogin = () => {
    // This is the correct approach. The browser needs to redirect to the
    // backend endpoint, which will then redirect to Google.
    window.location.href = 'http://localhost:8080/api/v1/user/auth/google';
  };

  return <Button onClick={handleLogin}>Connect Google</Button>;
};

export default GoogleLoginButton;
