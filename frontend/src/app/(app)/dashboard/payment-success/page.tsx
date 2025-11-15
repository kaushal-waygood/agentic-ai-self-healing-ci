import React from 'react';
import CheckoutStatusPage from './components/checkoutStatusPage';

import { checkOutMetadata } from '@/metadata/metadata';

export const metadata = {
  title: checkOutMetadata.title,
  description: checkOutMetadata.description,
  keywords: checkOutMetadata.keywords,
};

const page = () => {
  return <CheckoutStatusPage />;
};

export default page;
