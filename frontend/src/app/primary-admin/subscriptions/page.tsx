
import { SubscriptionsClient } from "@/components/admin/subscriptions-client";
import { PageHeader } from "@/components/common/page-header";
import { mockSubscriptionPlans } from "@/lib/data/subscriptions";
import { DollarSign } from "lucide-react";

export default function SubscriptionsDashboardPage() {
  return (
    <>
      <PageHeader
        title="Subscription Plan Management"
        description="View and edit all subscription plans available on the platform."
        icon={DollarSign}
      />
      <SubscriptionsClient initialPlans={mockSubscriptionPlans} />
    </>
  );
}
