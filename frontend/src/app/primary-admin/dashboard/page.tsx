
import { AdminDashboardClient } from "@/components/admin/dashboard-client";
import { mockOrganizations, mockUsers } from "@/lib/data/user";
import { mockSubscriptionPlans } from "@/lib/data/subscriptions";

export default function AdminDashboardPage() {
  // In a real app, this data would be fetched from a database/API.
  const users = mockUsers;
  const organizations = mockOrganizations;
  const plans = mockSubscriptionPlans;

  return (
    <AdminDashboardClient 
        users={users} 
        organizations={organizations} 
        plans={plans} 
    />
  );
}
