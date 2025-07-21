import { OrganizationClient } from '@/components/admin/organization-client';
import { PageHeader } from '@/components/common/page-header';
import { mockOrganizations, mockUsers } from '@/lib/data/user';
import { Building } from 'lucide-react';
import { useEffect } from 'react';

export default function OrganizationsDashboardPage() {
  return (
    <>
      <PageHeader
        title="Organization Management"
        description="View, create, and manage all partner organizations on the platform."
        icon={Building}
      />
      <OrganizationClient initialOrganizations={organizations} users={users} />
    </>
  );
}
