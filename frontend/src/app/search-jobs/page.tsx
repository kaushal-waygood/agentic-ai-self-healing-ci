// app/search-jobs/page.tsx (or wherever your page component is)
import { Suspense } from 'react';
import JobsPage from '@/components/jobs/JobPage'; // assuming you moved it to a separate file

export default function SearchJobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPage />
    </Suspense>
  );
}
