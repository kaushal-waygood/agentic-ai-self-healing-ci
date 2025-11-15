import React from 'react';
import SearchJobsPage from './components/searchJobPage';
import { searchJobsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: searchJobsMetadata.title,
  description: searchJobsMetadata.description,
  keywords: searchJobsMetadata.keywords,
};

const page = () => {
  return <SearchJobsPage />;
};

export default page;
