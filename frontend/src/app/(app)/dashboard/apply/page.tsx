import { Suspense } from 'react';
import { ApplicationWizardClient } from '@/components/application/application-wizard-client';

import { applicationWizardMetadata } from '@/metadata/metadata';

export const metadata = {
  title: applicationWizardMetadata.title,
  description: applicationWizardMetadata.description,
  keywords: applicationWizardMetadata.keywords,
};

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
