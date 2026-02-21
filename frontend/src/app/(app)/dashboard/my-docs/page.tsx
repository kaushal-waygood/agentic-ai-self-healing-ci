import React, { Suspense } from 'react';
import DocumentsPage from './components/documentPage';
import { myDocsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: myDocsMetadata.title,
  description: myDocsMetadata.description,
  keywords: myDocsMetadata.keywords,
};

const page = () => {
  return (
    <Suspense fallback={<div>Loading Documents...</div>}>
      <DocumentsPage />
    </Suspense>
  );
};

export default page;
