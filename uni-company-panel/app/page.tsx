'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  });
  return null;
};

export default page;
