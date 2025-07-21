
import { PageHeader } from "@/components/common/page-header";
import { PricingTable } from "@/components/subscriptions/pricing-table";
import { DollarSign } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Subscription Plans"
        description="Choose the plan that best fits your job search needs and unlock powerful AI features."
        icon={DollarSign}
      />
      <PricingTable />
    </>
  );
}
