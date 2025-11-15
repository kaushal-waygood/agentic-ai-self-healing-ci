import React from 'react';
import BugReportPage from './components/bugReportPage';
import { bugReportMetadata } from '@/metadata/metadata';

export const metadata = {
  title: bugReportMetadata.title,
  description: bugReportMetadata.description,
  keywords: bugReportMetadata.keywords,
};

const Page = () => {
  return <BugReportPage />;
};

export default Page;
