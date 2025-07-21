
import { PageHeader } from "@/components/common/page-header";
import { CoverLetterGeneratorClient } from "@/components/cover-letter/cover-letter-client";
import { Newspaper } from "lucide-react";

export default function CoverLetterGeneratorPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Cover Letter Studio"
        description="Generate a tailored cover letter with our interactive AI assistant."
        icon={Newspaper}
      />
      <CoverLetterGeneratorClient />
    </div>
  );
}
