import DashboardPage from './components/dashboardPage';
import { dashboardMetadata } from '@/metadata/metadata';

export const metadata = {
  title: dashboardMetadata.title,
  description: dashboardMetadata.description,
  keywords: dashboardMetadata.keywords,
};

const page = () => {
  return <DashboardPage />;
};

export default page;
