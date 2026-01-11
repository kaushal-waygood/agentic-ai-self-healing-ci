import JobsPage from '@/components/jobs/JobPage';
import { Navigation } from '@/components/layout/site-header';

export const dynamic = 'force-dynamic';

import { searchJobsMetadata } from '@/metadata/metadata';
import Image from 'next/image';
import OnboardingExperienceFeedback from '../(app)/dashboard/onboarding-tour/OnboardingExperienceFeedback';

export const metadata = {
  title: searchJobsMetadata.title,
  description: searchJobsMetadata.description,
  keywords: searchJobsMetadata.keywords,
};

export default function SearchJobsPage() {
  return (
    <>
      <Navigation />
      <JobsPage />
    </>
  );
}
