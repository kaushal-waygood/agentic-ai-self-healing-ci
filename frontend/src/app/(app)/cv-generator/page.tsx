import { PageHeader } from '@/components/common/page-header';
import { CvGeneratorClient } from '@/components/cv/cv-generator-client';
import { FileText } from 'lucide-react';

export default function CvGeneratorPage() {
  return (
    <>
      {/* <PageHeader
        title="AI CV Generator"
        description="Follow the steps to craft a world-class CV tailored for your next job application."
        icon={FileText}
      /> */}
      <CvGeneratorClient />
    </>
  );
}
