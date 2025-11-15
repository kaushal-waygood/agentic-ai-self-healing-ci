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
      <PrivacyPolicyPage />
    </div>
  );
};

export default page;
