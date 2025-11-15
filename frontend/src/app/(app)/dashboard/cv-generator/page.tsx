import { CvGeneratorClient } from '@/components/cv/cv-generator-client';
import { cvGeneratorMetadata } from '@/metadata/metadata';

export const metadata = {
  title: cvGeneratorMetadata.title,
  description: cvGeneratorMetadata.description,
  keywords: cvGeneratorMetadata.keywords,
};

export default function CvGeneratorPage() {
  return (
    <>
      <CvGeneratorClient />
    </>
  );
}
