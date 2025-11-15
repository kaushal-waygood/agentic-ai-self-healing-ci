import React from 'react';
import JobApplicationForm from './components/jobApplicationForm';
import { jobApplicationFormMetadata } from '@/metadata/metadata';

export const metadata = {
  title: jobApplicationFormMetadata.title,
  description: jobApplicationFormMetadata.description,
  keywords: jobApplicationFormMetadata.keywords,
};

const page = () => {
  return <JobApplicationForm />;
};

export default page;
