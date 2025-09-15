import React, { Suspense } from 'react';
import SettingsView from './SettingView';
import { Skeleton } from '@/components/ui/skeleton';

// A simple loading UI to show while the client component loads
const SettingsSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 animate-pulse">
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
    <div className="grid gap-8 lg:grid-cols-4">
      <div className="lg:col-span-1 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="lg:col-span-3 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  </div>
);

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsView />
    </Suspense>
  );
}
