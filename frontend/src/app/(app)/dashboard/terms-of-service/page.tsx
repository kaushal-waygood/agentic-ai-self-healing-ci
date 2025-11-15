import React from 'react';
import TermsAndConditionsPage from '@/components/privacy-and-terms/TermsOfService';
import { termsOfServiceMetadata } from '@/metadata/metadata';

export const metadata = {
  title: termsOfServiceMetadata.title,
  description: termsOfServiceMetadata.description,
  keywords: termsOfServiceMetadata.keywords,
};

const page = () => {
  return (
    <div>
      <TermsAndConditionsPage />
    </div>
  );
};

export default page;
