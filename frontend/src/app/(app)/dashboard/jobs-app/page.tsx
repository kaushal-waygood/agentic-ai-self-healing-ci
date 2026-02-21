// import React from 'react';
// import JobApplicationForm from './components/jobApplicationForm';
// import { jobApplicationFormMetadata } from '@/metadata/metadata';

// export const metadata = {
//   title: jobApplicationFormMetadata.title,
//   description: jobApplicationFormMetadata.description,
//   keywords: jobApplicationFormMetadata.keywords,
// };

// const page = () => {
//   return <JobApplicationForm />;
// };

// export default page;
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function page() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashboard');
  });
  return null;
}
