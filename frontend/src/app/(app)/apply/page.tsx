'use client';

import { Suspense, useEffect } from 'react';
import { ApplicationWizardClient } from '@/components/application/application-wizard-client';
import apiInstance from '@/services/api';

function ApplyPageContent() {
  return <ApplicationWizardClient />;
}

export default function ApplyPage() {
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await apiInstance.get('/jobs/apply');
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
      }
    };

    fetchJob();
  }, []);
  return (
    <Suspense fallback={<div>Loading Wizard...</div>}>
      <ApplyPageContent />
    </Suspense>
  );
}
