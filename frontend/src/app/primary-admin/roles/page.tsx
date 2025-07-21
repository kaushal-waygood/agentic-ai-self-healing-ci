
import { RolesManagementClient } from "@/components/admin/roles-management-client";
import { PageHeader } from "@/components/common/page-header";
import { mockAdminRoles } from "@/lib/data/user";
import { ShieldAlert } from "lucide-react";

export default function RolesDashboardPage() {
  console.log(mockAdminRoles)
  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Create and manage administrator roles and their permissions."
        icon={ShieldAlert}
      />
      <RolesManagementClient initialRoles={mockAdminRoles} />
    </>
  );
}
