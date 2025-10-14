'use client';

import { useEffect, useState, useRef } from 'react'; // Removed useCallback
import { JobCard, JobCardSkeleton } from '@/components/jobs/job-card';
import JobDetail from '@/components/jobs/JobDetail';
import { useJobs } from '@/hooks/jobs/useJobs';
import { useMediaQuery } from '@/hooks/jobs/useMediaQuery';
import { useRouter } from 'next/navigation';
import apiInstance from '@/services/api';
import { FilterModal } from './FilterModal';
import { SearchFilters } from './SearchFilters';
import { Search } from 'lucide-react';

export default function JobsPage() {
  const jobListRef = useRef<HTMLDivElement>(null);

  // FIX: Destructure only what the streaming hook provides.
  // REMOVED `pagination` and `loadMoreJobs`.
  const {
    jobs,
    loading,
    error,
    filters,
    setFilterModal,
    employmentTypes,
    experienceLevels,
    filterModal,
    handleFilterChange,
    resetFilters,
  } = useJobs();

  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Scroll to top when filters change. This is still useful.
  useEffect(() => {
    jobListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  const fetchJobDetails = async (slug: string) => {
    try {
      setSelectedJob(null);
      const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
      setSelectedJob(response.data.singleJob);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  };

  const handleCardClick = (slug: string) => {
    if (isMobile) {
      router.push(`/jobs/${slug}`);
    } else {
      fetchJobDetails(slug);
    }
  };

  // Select the first job from the list when the stream updates.
  useEffect(() => {
    if (!isMobile && jobs.length > 0) {
      if (!jobs.some((job) => job._id === selectedJob?._id)) {
        setSelectedJob(jobs[0]);
      }
    }
  }, [jobs, isMobile, selectedJob]);

  // REMOVED: The entire IntersectionObserver logic is no longer needed.
  // The stream provides all the data at once.

  if (error)
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 pt-1`}
    >
      <div className="container mx-auto px-1">
        <SearchFilters
          initialFilters={filters}
          onSearchChange={handleFilterChange}
          onOpenFilterModal={() => setFilterModal(true)}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <div className="">
            <div
              ref={jobListRef}
              className="space-y-2 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin"
            >
              {/* FIX: Show skeletons only on the initial load when the jobs array is empty. */}
              {loading && jobs.length === 0
                ? Array.from({ length: 8 }).map((_, index) => (
                    <JobCardSkeleton key={index} />
                  ))
                : jobs.map((job: any) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      isActive={selectedJob?._id === job._id}
                      onClick={() => handleCardClick(job.slug)}
                    />
                  ))}
              {/* REMOVED: The observer and loading spinner at the bottom. */}
            </div>
          </div>
          <div className=" hidden lg:block">
            {/* ... JobDetail and placeholder JSX remains the same ... */}
            <div className="sticky top-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin">
              {selectedJob ? (
                <JobDetail job={selectedJob} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white rounded-2xl border border-gray-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Select a job to view details
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Click on any position from the list to see the detailed
                    information.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <FilterModal
          isOpen={filterModal}
          onClose={() => setFilterModal(false)}
          employmentTypes={employmentTypes}
          experienceLevels={experienceLevels}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      </div>
    </div>
  );
}
