import { Footer } from '@/components/layout/footer';
import { Navigation } from '@/components/layout/site-header';
import PrivacyPolicyPage from '@/components/privacy-and-terms/PrivacyPolicy';

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
