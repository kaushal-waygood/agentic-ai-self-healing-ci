
import { SystemHealthClient } from "@/components/admin/system-health-client";
import { PageHeader } from "@/components/common/page-header";
import { Activity } from "lucide-react";

export default function SystemHealthPage() {
  return (
    <>
      <PageHeader
        title="System Health"
        description="Monitor the status of critical platform services and integrations."
        icon={Activity}
      />
      <SystemHealthClient />
    </>
  );
}
