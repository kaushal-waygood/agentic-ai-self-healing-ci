import { Suspense } from 'react';
import CandidatePage from '@/components/candidates/CandidatePage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CandidatePage />
    </Suspense>
  );
}
