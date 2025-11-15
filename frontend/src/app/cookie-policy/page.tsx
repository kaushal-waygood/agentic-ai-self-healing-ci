import React from 'react';
import CookiePolicyPage from './components/cookiePolicyPage';

import { cookiePolicyMetadata } from '@/metadata/metadata';

export const metadata = {
  title: cookiePolicyMetadata.title,
  description: cookiePolicyMetadata.description,
  keywords: cookiePolicyMetadata.keywords,
};

const page = () => {
  return <CookiePolicyPage />;
};

export default page;
