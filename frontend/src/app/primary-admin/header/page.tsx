
import { PageHeader } from "@/components/common/page-header";
import { HeaderManagementClient } from "@/components/admin/header-management-client";
import { mockHeaderData } from "@/lib/data/header";
import { PanelTop } from "lucide-react";

export default function HeaderManagementPage() {
  const headerData = mockHeaderData;

  return (
    <>
      <PageHeader
        title="Header Management"
        description="Manage the navigation links and dropdowns in the public-facing site header."
        icon={PanelTop}
      />
      <HeaderManagementClient initialData={headerData} />
    </>
  );
}
