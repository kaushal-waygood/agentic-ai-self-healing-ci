import { Footer } from '@/components/layout/footer';
import { Navigation } from '@/components/layout/site-header';
import TermsAndConditionsPage from '@/components/privacy-and-terms/TermsOfService';
import React from 'react';

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
