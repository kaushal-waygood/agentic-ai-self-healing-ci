import React from 'react';
import ZobsCampusAmbassador from '@/components/campus-ambassador/ZobsCampusAmbassador';
import { Navigation } from '@/components/layout/site-header';
import { Footer } from '@/components/layout/footer';

const page = () => {
  return (
    <div>
      <Navigation />
      <ZobsCampusAmbassador />
      <Footer />
    </div>
  );
};
export default page;
