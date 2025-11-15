import { Suspense } from 'react';
import JobsPage from '@/components/jobs/JobPage';

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
