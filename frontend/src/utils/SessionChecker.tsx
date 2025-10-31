'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalToken } from '@/utils/localToken';

export function SessionChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getLocalToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}
