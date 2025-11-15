import React from 'react';
import SupportPage from './components/supportPage';

import { supportMetadata } from '@/metadata/metadata';

export const metadata = {
  title: supportMetadata.title,
  description: supportMetadata.description,
  keywords: supportMetadata.keywords,
};

const page = () => {
  return <SupportPage />;
};

export default page;
