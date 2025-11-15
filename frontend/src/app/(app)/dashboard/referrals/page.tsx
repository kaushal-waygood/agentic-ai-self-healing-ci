import React from 'react';
import ReferralsPage from './components/referralsPage';

import { referralsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: referralsMetadata.title,
  description: referralsMetadata.description,
  keywords: referralsMetadata.keywords,
};

const page = () => {
  return <ReferralsPage />;
};

export default page;
