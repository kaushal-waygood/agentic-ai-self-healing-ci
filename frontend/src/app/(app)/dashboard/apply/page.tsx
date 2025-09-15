'use client';

import { Suspense, useEffect } from 'react';
import { ApplicationWizardClient } from '@/components/application/application-wizard-client';
import apiInstance from '@/services/api';

function ApplyPageContent() {
  return <ApplicationWizardClient />;
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div>Loading Wizard...</div>}>
      <ApplyPageContent />
    </Suspense>
  );
}
