import { Suspense } from 'react';
import { UserManagementClient } from '@/components/admin/user-management-client';
import { PageHeader } from '@/components/common/page-header';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import { Users } from 'lucide-react';

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
      {/* Suspense is needed because UserManagementClient uses useSearchParams */}
      <Suspense
        fallback={
          <div className="flex items-center flex-col justify-center min-h-screen">
            {/* <Loader2 className="w-10 h-10 animate-spin" /> */}
            <div>
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 animate-bounce"
              />
            </div>

            <div className="text-lg">LOADING...</div>
          </div>
        }
      >
        <UserManagementPageContent />
      </Suspense>
    </>
  );
}
