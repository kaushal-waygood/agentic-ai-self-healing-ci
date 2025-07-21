
import { notFound } from "next/navigation";
import { mockUsers, mockOrganizations } from "@/lib/data/user";
import { mockSubscriptionPlans } from "@/lib/data/subscriptions";
import { PageHeader } from "@/components/common/page-header";
import { User } from "lucide-react";
import { UserDetailClient } from "@/components/admin/user-detail-client";
import { BackButton } from "@/components/common/back-button";

export default async function UserDetailPage({ params }: { params: { userId: string } }) {
  const user = mockUsers.find(u => u.id === params.userId);
  
  if (!user) {
    notFound();
  }
  
  const organization = user.organizationId ? mockOrganizations.find(o => o.id === user.organizationId) : null;
  const plan = mockSubscriptionPlans.find(p => p.id === user.currentPlanId);

  return (
    <>
      <PageHeader
        title={user.fullName}
        description={`Manage user profile, subscription, and view activity.`}
        icon={User}
        actions={<BackButton text="Back to Users"/>}
      />
      <UserDetailClient 
        user={user} 
        organization={organization}
        plan={plan}
        allPlans={mockSubscriptionPlans}
        allOrganizations={mockOrganizations}
      />
    </>
  );
}
