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

  const isDashboardRoute = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (!isDashboardRoute) {
      setIsChecking(false);
      return;
    }

    if (!token || token === null) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [pathname, token, authLoading, isDashboardRoute, router]);

  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  // if (isChecking || authLoading) {
  //   return <Loader />;
  // }

  return <>{children}</>;
}
