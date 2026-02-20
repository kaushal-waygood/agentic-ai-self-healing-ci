import { Suspense } from 'react';
import JobsPage from '@/components/jobs/JobPage';
import { Loader } from '@/components/Loader';

export default function SearchJobsPage() {
  return (
    <Suspense fallback={<Loader message="Loading jobs..." />}>
      <JobsPage />
    </Suspense>
  );
}
