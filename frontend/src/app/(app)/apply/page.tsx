
'use client';

import { Suspense } from 'react';
import { ApplicationWizardClient } from '@/components/application/application-wizard-client';

function ApplyPageContent() {
  return (
      <ApplicationWizardClient />
  );
}

export default function ApplyPage() {
  return (
    // Suspense is required because the wizard client uses useSearchParams
    <Suspense fallback={<div>Loading Wizard...</div>}>
      <ApplyPageContent />
    </Suspense>
  )
}
