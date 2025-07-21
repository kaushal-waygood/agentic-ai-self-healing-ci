import { PageHeader } from "@/components/common/page-header";
import { AutoApplyClient } from "@/components/auto-apply/auto-apply-client";
import { Bot } from "lucide-react";

export default function AiAutoApplyPage() {
  return (
    <>
      <PageHeader
        title="AI Auto Apply Agent"
        description="Configure your personal AI agent to find and prepare job applications for you."
        icon={Bot}
      />
      <AutoApplyClient />
    </>
  );
}
