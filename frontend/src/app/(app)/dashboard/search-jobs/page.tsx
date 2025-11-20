import React from 'react';
import SearchJobsPage from './components/searchJobPage';
import { searchJobsMetadata } from '@/metadata/metadata';
import TourManager from '@/components/TourManager';

export const metadata = {
  title: searchJobsMetadata.title,
  description: searchJobsMetadata.description,
  keywords: searchJobsMetadata.keywords,
};

const page = () => {
  return (
    <>
      <TourManager pageKey="search-job" startImmediately={false} />
      <SearchJobsPage />
    </>
  );
};

export default page;
