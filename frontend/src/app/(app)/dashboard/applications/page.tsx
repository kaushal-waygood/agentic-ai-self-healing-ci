import React from 'react';
import ApplicationsPage from './components/applicationPage';

import { myApplicationsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: myApplicationsMetadata.title,
  description: myApplicationsMetadata.description,
  keywords: myApplicationsMetadata.keywords,
};

const page = () => {
  return <ApplicationsPage />;
};

export default page;
