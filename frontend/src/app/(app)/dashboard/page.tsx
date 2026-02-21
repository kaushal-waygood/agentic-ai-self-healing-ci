import { Suspense } from 'react';
import DashboardPage from './components/dashboardPage';
import { dashboardMetadata } from '@/metadata/metadata';

export const metadata = {
  title: dashboardMetadata.title,
  description: dashboardMetadata.description,
  keywords: dashboardMetadata.keywords,
};

const page = () => {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardPage />
    </Suspense>
  );
};

export default page;
