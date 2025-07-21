import { AdminManagementClient } from '@/components/admin/admin-management-client';
import { PageHeader } from '@/components/common/page-header';
import { mockUsers } from '@/lib/data/user';
import { ShieldAlert } from 'lucide-react';

export default function AdminsDashboardPage() {
  const admins = mockUsers.filter((u) => u.role === 'PrimaryAdmin');

  return (
    <>
      <PageHeader
        title="Admin User Management"
        description="Add or edit primary administrators and assign them roles."
        icon={ShieldAlert}
      />
      <AdminManagementClient initialAdmins={admins} />
    </>
  );
}
