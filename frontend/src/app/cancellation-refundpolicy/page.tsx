import { Footer } from '@/components/layout/footer';
import { Navigation } from '@/components/layout/site-header';
import CancellationRefund from '@/components/privacy-and-terms/Cancellation-Refund';
import React from 'react';

const page = () => {
  return (
    <div>
      <Navigation />
      <CancellationRefund />
      <Footer />
    </div>
  );
};

export default page;
