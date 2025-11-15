import { Footer } from '@/components/layout/footer';
import { Navigation } from '@/components/layout/site-header';
import PrivacyPolicyPage from '@/components/privacy-and-terms/PrivacyPolicy';

import { privacyPolicyMetadata } from '@/metadata/metadata';

export const metadata = {
  title: privacyPolicyMetadata.title,
  description: privacyPolicyMetadata.description,
  keywords: privacyPolicyMetadata.keywords,
};

const page = () => {
  return (
    <div>
      <Navigation />
      <PrivacyPolicyPage />
      <Footer />
    </div>
  );
};

export default page;
