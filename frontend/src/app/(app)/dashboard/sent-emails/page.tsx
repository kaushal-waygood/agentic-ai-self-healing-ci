import React, { Suspense } from 'react';
import SentEmailsClient from './SentEmailsClient';

export const metadata = {
  title: 'Sent Emails to Recruiters | ZobsAI',
  description: "Track emails you've sent to recruiters from the platform.",
};

export default function SentEmailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SentEmailsClient />
    </Suspense>
  );
}
