// app/(auth)/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// You can move these helpers to a shared utils file, e.g., /lib/auth.ts
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() < expirationTime;
  } catch (error) {
    return false;
  }
}

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken =
      localStorage.getItem('accessToken') || getCookie('accessToken');

    // If a valid token exists, redirect to the dashboard
    if (accessToken && isTokenValid(accessToken)) {
      router.push('/dashboard');
    } else {
      // Otherwise, the user is not authenticated, so we can show the page
      setIsLoading(false);
    }
  }, [router]);

  // While checking, show a loading state to prevent flashing the login page
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not loading and not redirected, show the children (e.g., the Login page)
  return <>{children}</>;
}
