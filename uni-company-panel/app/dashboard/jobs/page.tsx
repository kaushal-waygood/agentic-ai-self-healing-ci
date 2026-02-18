// app/dashboard/jobs/page.tsx
import { Suspense } from 'react';
import JobsPageClient from '@/components/getjobs/Jobs'; // Rename your current file/component
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      }
    >
      <JobsPageClient />
    </Suspense>
  );
}
