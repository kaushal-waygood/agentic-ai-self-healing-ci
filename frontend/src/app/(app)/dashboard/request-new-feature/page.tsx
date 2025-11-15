import React from 'react';
import RequestNewFeature from './components/requestNewFeature';
import { requestNewFeatureMetadata } from '@/metadata/metadata';

export const metadata = {
  title: requestNewFeatureMetadata.title,
  description: requestNewFeatureMetadata.description,
  keywords: requestNewFeatureMetadata.keywords,
};

const page = () => {
  return <RequestNewFeature />;
};

export default page;
