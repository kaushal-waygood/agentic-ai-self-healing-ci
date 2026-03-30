import { Suspense } from 'react';
import DashboardPage from './components/dashboardPage';
import { dashboardMetadata } from '@/metadata/metadata';
import { Loader } from '@/components/Loader';

export const metadata = {
  title: dashboardMetadata.title,
  description: dashboardMetadata.description,
  keywords: dashboardMetadata.keywords,
};

const page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardPage />
    </Suspense>
  );
};

export default page;
