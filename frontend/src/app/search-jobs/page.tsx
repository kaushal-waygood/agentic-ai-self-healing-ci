// app/search-jobs/page.tsx (or wherever your page component is)
import { Suspense } from 'react';
import JobsPage from '@/components/jobs/JobPage';
import { Navigation } from '@/components/layout/site-header';

export const dynamic = 'force-dynamic';

import { searchJobsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: searchJobsMetadata.title,
  description: searchJobsMetadata.description,
  keywords: searchJobsMetadata.keywords,
};

export default function SearchJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex  items-center flex-col justify-center min-h-screen">
          {/* <Loader2 className="w-10 h-10 animate-spin" /> */}
          <div>
            <img src="/logo.png" alt="" className="w-10 h-10 animate-bounce" />
          </div>

          <div className="text-lg">LOADING...</div>
        </div>
      }
    >
      <Navigation />
      <JobsPage />
    </Suspense>
  );
}
