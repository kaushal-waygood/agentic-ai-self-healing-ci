import { PageHeader } from '@/components/common/page-header';
import { JobCard } from '@/components/jobs/job-card';
import { Search } from 'lucide-react';
import { searchJobs } from '@/services/api/job';
import Link from 'next/link';

interface SearchParams {
  query?: string;
  country?: string;
  page?: number;
  employmentTypes?: string | string[];
  jobRequirements?: string | string[];
  radius?: string | number;
  datePosted?: string;
  workFromHome?: boolean;
}

async function fetchJobs(searchParams: SearchParams) {
  try {
    const response = await searchJobs({
      page: searchParams.page || 1,
      query: searchParams.query,
      country: searchParams.country,
      datePosted: searchParams.datePosted,
      limit: 20,
    });
    return response?.data?.jobs || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export default async function SearchJobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const hasQuery = !!searchParams?.query;
  const jobs = hasQuery ? await fetchJobs(searchParams) : [];

  return (
    <>
      <PageHeader
        title="Find Your Next Job"
        description="Use the filters to search for job opportunities from various sources."
        icon={Search}
      />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="sticky top-6">
          <div>Filters will go here</div>
        </aside>

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
              {jobs.map((job: any) => (
                <Link
                  href={`/jobs/${job._id || job.id}`}
                  key={job._id || job.id}
                >
                  <JobCard job={job} />
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
