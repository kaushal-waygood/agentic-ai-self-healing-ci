import { Suspense } from 'react';
import { CvGeneratorClient } from '@/components/cv/cv-generator-client';
import { cvGeneratorMetadata } from '@/metadata/metadata';

export const metadata = {
  title: cvGeneratorMetadata.title,
  description: cvGeneratorMetadata.description,
  keywords: cvGeneratorMetadata.keywords,
};

export default function CvGeneratorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full" /></div>}>
      <CvGeneratorClient />
    </Suspense>
  );
}
