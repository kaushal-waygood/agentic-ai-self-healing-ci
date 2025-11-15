import React from 'react';
import OnboardingPage from './components/onBoardingPage';
import { onBoardingMetadata } from '@/metadata/metadata';

export const metadata = {
  title: onBoardingMetadata.title,
  description: onBoardingMetadata.description,
  keywords: onBoardingMetadata.keywords,
};

const page = () => {
  return <OnboardingPage />;
};

export default page;
