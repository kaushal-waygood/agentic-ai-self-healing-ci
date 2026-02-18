'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getToken } from '@/hooks/useToken';

// Helper function to get cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // SSR safety

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

// Optional: Check if token is valid (not expired)
function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    // Decode the token to check expiration (JWT format)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expirationTime;
  } catch (error) {
    return false;
  }
}

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading');

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getToken();
      if (accessToken && isTokenValid(accessToken)) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
        router.push('/login');
      }
    };

    checkAuth();
  }, [authStatus]);

  if (authStatus === 'loading') {
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
        <div className="text-md font-semibold">LOADING...</div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
