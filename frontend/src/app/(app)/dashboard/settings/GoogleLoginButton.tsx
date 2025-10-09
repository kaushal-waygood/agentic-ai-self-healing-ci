'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming ShadCN UI component
import { RootState } from '@/redux/rootReducer';
import { useSelector } from 'react-redux';

// const GoogleLoginButton = () => {
//   const handleLogin = () => {
//     // This is the correct approach. The browser needs to redirect to the
//     // backend endpoint, which will then redirect to Google.
//     window.location.href = 'http://localhost:8080/api/v1/user/auth/google';
//   };

//   return <Button onClick={handleLogin}>Connect Google</Button>;
// };

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const NEXT_PUBLIC_API_URL = 'https://api.dev.zobsai.com';

  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = `${NEXT_PUBLIC_API_URL}/api/v1/user/auth/google/${user._id}`;

    setTimeout(() => setIsLoading(false), 5000);
  };

  return (
    <Button onClick={handleLogin} disabled={isLoading}>
      Connect Google
    </Button>
  );
};

export default GoogleLoginButton;
