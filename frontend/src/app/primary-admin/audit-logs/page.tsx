
import { AuditLogClient } from "@/components/admin/audit-log-client";
import { PageHeader } from "@/components/common/page-header";
import { mockAuditLogs } from "@/lib/data/audit-logs";
import { ListChecks } from "lucide-react";

export default function AuditLogsPage() {
  const logs = mockAuditLogs;

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Review important actions taken by administrators on the platform."
        icon={ListChecks}
      />
      <AuditLogClient initialLogs={logs} />
    </>
  );
}
