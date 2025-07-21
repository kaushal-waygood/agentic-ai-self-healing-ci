'use client';

import Cookie from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = Cookie.get('accessToken');

  if (!token) {
    Cookie.remove('accessToken');
    Cookie.remove('refreshToken');
    router.push('/login');
  }

  return <>{children}</>;
}
