import React from 'react';
import DocumentsPage from './components/documentPage';
import { myDocsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: myDocsMetadata.title,
  description: myDocsMetadata.description,
  keywords: myDocsMetadata.keywords,
};

const page = () => {
  return <DocumentsPage />;
};

export default page;
