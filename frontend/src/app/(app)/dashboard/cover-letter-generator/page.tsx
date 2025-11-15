import { CoverLetterGeneratorClient } from '@/components/cover-letter/cover-letter-client';
import { coverLetterGeneratorMetadata } from '@/metadata/metadata';

export const metadata = {
  title: coverLetterGeneratorMetadata.title,
  description: coverLetterGeneratorMetadata.description,
  keywords: coverLetterGeneratorMetadata.keywords,
};

export default function CoverLetterGeneratorPage() {
  return (
    <div className="flex flex-col">
      <CoverLetterGeneratorClient />
    </div>
  );
}
