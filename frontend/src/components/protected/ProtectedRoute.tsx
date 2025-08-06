'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';

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
    const token = Cookie.get('accessToken');

    if (!token) {
      console.warn('Authentication failed - no token found');
      setAuthStatus('unauthenticated');
      router.push('/login');
    } else {
      console.log('Authentication successful - token found');
      setAuthStatus('authenticated');
    }
  }, [router]);

  if (authStatus === 'loading') {
    return <div>Checking authentication...</div>;
  }

  if (authStatus === 'unauthenticated') {
    return null; // The redirect is already handled in useEffect.
  }

  return <>{children}</>;
}
