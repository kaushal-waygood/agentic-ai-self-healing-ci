import React from 'react';
import JobDetailPage from './components/jobDetailPage';
import { jobDetailsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: jobDetailsMetadata.title,
  description: jobDetailsMetadata.description,
  keywords: jobDetailsMetadata.keywords,
};

const page = () => {
  return <JobDetailPage />;
};

export default page;
