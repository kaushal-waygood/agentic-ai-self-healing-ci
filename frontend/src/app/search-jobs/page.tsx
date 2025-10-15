// app/search-jobs/page.tsx (or wherever your page component is)
import { Suspense } from 'react';
import type { Metadata } from 'next';
import JobsPage from '@/components/jobs/JobPage';
import { Navigation } from '@/components/layout/site-header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search Jobs | Find Your Next Career Opportunity',
  description:
    'Explore thousands of job openings across various industries. Use our search filters to find the perfect job for you and apply today.',
  keywords: [
    'jobs',
    'career',
    'employment',
    'job search',
    'work',
    'hiring',
    'job listings',
    'recruitment',
  ],
};

export default function SearchJobsPage() {
  return (
    <Suspense fallback  ={<div>Loading...</div>}>
      <Navigation />
      <JobsPage />
    </Suspense>
  );
}
