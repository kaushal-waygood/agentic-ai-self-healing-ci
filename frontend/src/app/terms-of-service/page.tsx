import React from 'react';
import { Footer } from '@/components/layout/footer';
import { Navigation } from '@/components/layout/site-header';
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
      <Navigation />
      <TermsAndConditionsPage />
      <Footer />
    </div>
  );
};

export default page;
