'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import Image from 'next/image';
import { Loader } from '../Loader';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const [isChecking, setIsChecking] = useState(true);

  // Check if the current route starts with /dashboard
  const isDashboardRoute = pathname.startsWith('/dashboard');

  useEffect(() => {
    // 1. If it's NOT a dashboard route, we don't need to guard it
    if (!isDashboardRoute) {
      setIsChecking(false);
      return;
    }

    // 2. If it IS a dashboard route, wait for auth to finish loading
    if (!authLoading) {
      if (!token) {
        // No token found, send to login
        router.replace('/login');
      } else {
        // Token exists, allow access
        setIsChecking(false);
      }
    }
  }, [pathname, token, authLoading, isDashboardRoute, router]);

  // If we are not on a dashboard route, just render children (Home, Login, etc.)
  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  // Show loading while verifying dashboard access
  if (isChecking || authLoading) {
    return <Loader />;
  }

  return <>{children}</>;
}
