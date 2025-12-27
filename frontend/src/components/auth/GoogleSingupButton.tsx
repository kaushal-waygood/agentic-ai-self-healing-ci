'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming ShadCN UI button
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/services/api';

export function GoogleSignInButton({ authType = 'login' }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = () => {
    setIsLoading(true);
    const googleAuthUrl = `${API_BASE_URL}/api/v1/user/google/auth/redirect`;
    window.location.href = googleAuthUrl;
    setTimeout(() => setIsLoading(false), 5000);
  };

  // Determine button text based on the authType prop
  const buttonText =
    authType === 'signup' ? 'Login with Google' : 'Sign in with Google';
  const loadingText =
    authType === 'signup'
      ? 'Redirecting to Google...'
      : 'Redirecting to Google...';

  return (
    <Button
      onClick={handleGoogleAuth}
      variant="outline"
      className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400
                 transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md
                 disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">{loadingText}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {/* Google Icon SVG */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-gray-700 font-medium text-base">
            {buttonText}
          </span>
        </div>
      )}
    </Button>
  );
}

export function LinkedInSignInButton({ authType = 'login' }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkedInAuth = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: '78cxzsxixqb18l',
        redirect_uri: `${API_BASE_URL}/api/v1/user/linkedin/callback`,
        scope: 'openid email profile',
      });

      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    } catch (error) {
      console.error('LinkedIn Auth Error:', error);
      // Reset loading on error so user can try again
      setIsLoading(false);
    }
  };

  const buttonText =
    authType === 'signup' ? 'Sign up with LinkedIn' : 'Login with LinkedIn';
  const loadingText = 'Connecting to LinkedIn...';

  return (
    <Button
      onClick={handleLinkedInAuth}
      variant="outline"
      className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400
                 transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md
                 disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">{loadingText}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {/* LinkedIn Icon SVG */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              fill="#0077B5" // Official LinkedIn Blue
            />
          </svg>
          <span className="text-gray-700 font-medium text-base">
            {buttonText}
          </span>
        </div>
      )}
    </Button>
  );
}
