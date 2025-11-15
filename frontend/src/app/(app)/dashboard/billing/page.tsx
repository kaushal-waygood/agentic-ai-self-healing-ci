import React from 'react';
import BillingPage from './components/billingPage';
import { billingMetadata } from '@/metadata/metadata';

export const metadata = {
  title: billingMetadata.title,
  description: billingMetadata.description,
  keywords: billingMetadata.keywords,
};

const page = () => {
  return <BillingPage />;
};

export default page;
