import { PageHeader } from '@/components/common/page-header';
import { JobCard } from '@/components/jobs/job-card';
import { Search } from 'lucide-react';
import { searchJobsFlow } from '@/ai/flows/search-jobs-flow';
import { JobSearchFlowInput } from '@/lib/schemas/job-search-schema';
import axios from 'axios';
import apiInstance from '@/services/api';

async function fetchJobs(searchParams: JobSearchFlowInput) {
  // Process params safely
  const processedParams: JobSearchFlowInput = {
    ...searchParams,
    employmentTypes: Array.isArray(searchParams.employmentTypes)
      ? searchParams.employmentTypes
      : searchParams.employmentTypes
      ? [searchParams.employmentTypes]
      : [],
    jobRequirements: Array.isArray(searchParams.jobRequirements)
      ? searchParams.jobRequirements
      : searchParams.jobRequirements
      ? [searchParams.jobRequirements]
      : [],
    radius: searchParams.radius ? Number(searchParams.radius) : undefined,
  };

  return await searchJobsFlow(processedParams);
}

export default async function SearchJobsPage({
  searchParams,
}: {
  searchParams: JobSearchFlowInput;
}) {
  const hasQuery = searchParams?.query;
  let jobs = [];

  if (hasQuery) {
    try {
      const response = await apiInstance.post('/job');
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }

  return (
    <>
      <PageHeader
        title="Find Your Next Job"
        description="Use the filters to search for job opportunities from various sources."
        icon={Search}
      />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Filters section - simplified */}
        <aside className="sticky top-6">
          {/* Your filter component would go here */}
          <div>Filters will go here</div>
        </aside>

        {/* Main job listings */}
        <main>
          {!hasQuery ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="font-semibold">Start Your Job Search</p>
              <p className="text-muted-foreground mt-2">
                Enter a search query to find job opportunities.
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="font-semibold">No Jobs Found</p>
              <p className="text-muted-foreground mt-2">
                Your search did not match any job listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
