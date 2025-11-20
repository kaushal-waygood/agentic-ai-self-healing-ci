import React from 'react';
import JobDetailPage from './components/jobDetailPage';
import { jobDetailsMetadata } from '@/metadata/metadata';
import { Navigation } from '@/components/layout/site-header';

export const metadata = {
  title: jobDetailsMetadata.title,
  description: jobDetailsMetadata.description,
  keywords: jobDetailsMetadata.keywords,
};

const page = () => {
  return (
    <>
      <div className="container">
        <JobDetailPage />
      </div>
    </>
  );
};

export default page;
