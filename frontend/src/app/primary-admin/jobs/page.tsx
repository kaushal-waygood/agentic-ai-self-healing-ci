
import { JobListingsModerationClient } from "@/components/admin/job-listings-moderation-client";
import { PageHeader } from "@/components/common/page-header";
import { mockJobListings } from "@/lib/data/jobs";
import { mockOrganizations } from "@/lib/data/user";
import { FileUp } from "lucide-react";

export default function JobManagementPage() {
  const jobs = mockJobListings;
  const organizations = mockOrganizations;

  return (
    <>
      <PageHeader
        title="Job Postings Moderation"
        description="Review, approve, or reject job listings submitted by partners and via API."
        icon={FileUp}
      />
      <JobListingsModerationClient 
        initialJobs={jobs}
        organizations={organizations}
      />
    </>
  );
}
