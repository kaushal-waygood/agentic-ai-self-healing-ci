
import { PageHeader } from "@/components/common/page-header";
import { FooterManagementClient } from "@/components/admin/footer-management-client";
import { mockFooterData } from "@/lib/data/footer";
import { PanelBottom } from "lucide-react";

export default function FooterManagementPage() {
  const footerData = mockFooterData;

  return (
    <>
      <PageHeader
        title="Footer Management"
        description="Manage the content and structure of the application's global footer."
        icon={PanelBottom}
      />
      <FooterManagementClient initialData={footerData} />
    </>
  );
}
