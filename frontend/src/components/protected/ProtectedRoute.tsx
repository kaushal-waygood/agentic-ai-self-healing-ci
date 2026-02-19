'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import Image from 'next/image';

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
    return (
      <div className="flex items-center flex-col justify-center min-h-screen">
        <div className="">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="w-20 h-20"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
