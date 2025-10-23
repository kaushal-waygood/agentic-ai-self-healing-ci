'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { JobCard, JobCardSkeleton } from '@/components/jobs/job-card';
import JobDetail from '@/components/jobs/JobDetail';
import { useJobs } from '@/hooks/jobs/useJobs';
import { useMediaQuery } from '@/hooks/jobs/useMediaQuery';
import { useRouter, useSearchParams } from 'next/navigation';
import apiInstance from '@/services/api';
import { FilterModal } from './FilterModal';
import { SearchFilters } from './SearchFilters';
import { Search, Frown } from 'lucide-react';

export default function JobsPage() {
  const jobListRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    jobs,
    loading,
    error,
    filters,
    pagination,
    setFilterModal,
    employmentTypes,
    experienceLevels,
    filterModal,
    handleFilterChange,
    loadMoreJobs,
    notification,
  } = useJobs();

  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const fetchJobDetails = useCallback(async (slug: string) => {
    try {
      const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
      if (response.data && response.data.singleJob) {
        setSelectedJob(response.data.singleJob);
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  }, []);

  // Effect to scroll the job list to the top when filters change
  useEffect(() => {
    jobListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  // Effect to handle initial job selection from URL or default to the first job
  useEffect(() => {
    const slug = searchParams.get('job');
    if (slug) {
      fetchJobDetails(slug);
    } else if (jobs.length > 0) {
      setSelectedJob(jobs[0]);
    } else {
      setSelectedJob(null); // Clear selection if there are no jobs
    }
  }, [jobs, searchParams, fetchJobDetails]);

  // Effect for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasNextPage && !loading) {
          loadMoreJobs();
        }
      },
      { threshold: 1.0 },
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [loading, pagination.hasNextPage, loadMoreJobs]);

  const handleCardClick = (slug: string) => {
    if (isMobile) {
      router.push(`/jobs/${slug}`);
    } else {
      fetchJobDetails(slug);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 pt-1">
      <div className="container mx-auto px-1">
        <SearchFilters
          initialFilters={filters}
          onSearchChange={handleFilterChange}
          onOpenFilterModal={() => setFilterModal(true)}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          {/* Job List Column */}
          <div className="">
            <div
              ref={jobListRef}
              className="space-y-2 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin"
            >
              {/* Notification for No Results */}
              {notification && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white rounded-lg border">
                  <Frown className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-semibold">{notification}</p>
                </div>
              )}

              {/* Initial Loading Skeletons */}
              {loading &&
                jobs.length === 0 &&
                Array.from({ length: 8 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}

              {/* Job Cards */}
              {!notification &&
                jobs.map((job: any) => (
                  <JobCard
                    key={job._id || job.jobId}
                    job={job}
                    isActive={selectedJob?._id === job._id}
                    onClick={() => handleCardClick(job.slug)}
                  />
                ))}

              {/* Loading Skeleton for Infinite Scroll */}
              {loading && jobs.length > 0 && (
                <JobCardSkeleton key="loading-skeleton" />
              )}

              {/* Observer for Infinite Scroll */}
              <div ref={observerRef} style={{ height: '1px' }} />
            </div>
          </div>

          {/* Job Detail Column (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin">
              {selectedJob ? (
                <JobDetail job={selectedJob} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white rounded-2xl border border-gray-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    {jobs.length > 0
                      ? 'Select a job to view details'
                      : 'Your next opportunity awaits'}
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    {jobs.length > 0
                      ? 'Click on any position to see the details.'
                      : 'Use the search filters above to find jobs.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        <FilterModal
          isOpen={filterModal}
          onClose={() => setFilterModal(false)}
          employmentTypes={employmentTypes}
          experienceLevels={experienceLevels}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={() =>
            handleFilterChange({
              query: '',
              country: '',
              state: '',
              city: '',
              datePosted: '',
              employmentType: [],
              experience: [],
            })
          }
        />
      </div>
    </div>
  );
}
