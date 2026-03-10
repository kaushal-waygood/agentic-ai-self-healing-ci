import { Suspense } from 'react';
import { CoverLetterGeneratorClient } from '@/components/cover-letter/cover-letter-client';
import { coverLetterGeneratorMetadata } from '@/metadata/metadata';

export const metadata = {
  title: coverLetterGeneratorMetadata.title,
  description: coverLetterGeneratorMetadata.description,
  keywords: coverLetterGeneratorMetadata.keywords,
};

export default function CoverLetterGeneratorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full" /></div>}>
      <div className="flex flex-col">
        <CoverLetterGeneratorClient />
      </div>
    </Suspense>
  );
}
