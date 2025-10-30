// app/search-jobs/page.tsx (or wherever your page component is)
import { Suspense } from 'react';
import type { Metadata } from 'next';
import JobsPage from '@/components/jobs/JobPage';
// export const dynamic = 'force-dynamic';

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
    <Suspense
      fallback={
        <div className="flex items-center flex-col justify-center min-h-screen">
          {/* <Loader2 className="w-10 h-10 animate-spin" /> */}
          <div>
            <img src="/logo.png" alt="" className="w-10 h-10 animate-bounce" />
          </div>

          <div className="text-lg">LOADING...</div>
        </div>
      }
    >
      <JobsPage />
    </Suspense>
  );
}
