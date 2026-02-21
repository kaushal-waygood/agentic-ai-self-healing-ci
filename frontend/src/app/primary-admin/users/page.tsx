import { Suspense } from 'react';
import { UserManagementClient } from '@/components/admin/user-management-client';
import { PageHeader } from '@/components/common/page-header';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import { Users } from 'lucide-react';
import { Loader } from '@/components/Loader';

// Wrapper component to allow Suspense boundary
function UserManagementPageContent() {
  const plans = mockSubscriptionPlans;
  return <UserManagementClient plans={plans} />;
}

export default function UsersDashboardPage() {
  return (
    <>
      <PageHeader
        title="User Management"
        description="View, search, and manage all users on the platform."
        icon={Users}
      />
      <Suspense fallback={<Loader />}>
        <UserManagementPageContent />
      </Suspense>
    </>
  );
}
