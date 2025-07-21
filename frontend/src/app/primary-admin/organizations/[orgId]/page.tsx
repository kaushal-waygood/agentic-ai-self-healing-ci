
import { notFound } from "next/navigation";
import { mockOrganizations, mockUsers } from "@/lib/data/user";
import { PageHeader } from "@/components/common/page-header";
import { Building } from "lucide-react";
import { OrganizationDetailClient } from "@/components/admin/organization-detail-client";
import { BackButton } from "@/components/common/back-button";

export default function OrganizationDetailPage({ params }: { params: { orgId: string } }) {
  const organization = mockOrganizations.find(o => o.id === params.orgId);
  
  if (!organization) {
    notFound();
  }

  const members = mockUsers.filter(u => u.organizationId === params.orgId);

  return (
    <>
      <PageHeader
        title={organization.name}
        description="Manage organization members, settings, and view analytics."
        icon={Building}
        actions={<BackButton text="Back to Organizations"/>}
      />
      <OrganizationDetailClient organization={organization} initialMembers={members} />
    </>
  );
}
