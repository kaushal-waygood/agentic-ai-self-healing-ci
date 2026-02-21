// src/components/auth/RedirectGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/hooks/useToken';

export default function RedirectGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return null; // This component renders nothing, it just runs logic
}
