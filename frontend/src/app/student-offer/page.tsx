import { Footer } from '@/components/layout/footer';
import { Navigation } from '@/components/layout/site-header';
import StudentOfferPage from '@/components/student-offer/StudentOffer';
import React from 'react';

const page = () => {
  return (
    <div>
      <Navigation />
      <StudentOfferPage />
      <Footer />
    </div>
  );
};

export default page;
