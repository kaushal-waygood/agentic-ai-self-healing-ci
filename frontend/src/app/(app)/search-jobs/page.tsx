'use client';

import { useEffect, useState, useRef } from 'react';
import { JobCard } from '@/components/jobs/job-card';
import JobDetail from '@/components/jobs/JobDetail';
import { useJobs } from '@/hooks/jobs/useJobs';
import { useMediaQuery } from '@/hooks/jobs/useMediaQuery';
import { useRouter, useSearchParams } from 'next/navigation';
import apiInstance from '@/services/api';
import { Pagination } from '@/components/utils/Pagination';
import { FilterModal } from './FilterModal';
import { SearchFilters } from './SearchFilters';

export default function JobsPage() {
  const {
    jobs,
    loading,
    error,
    pagination,
    handlePageChange,
    filters,
    handleFilterChange,
    handleSearchInput,
    setFilterModal,
    employmentTypes,
    experienceLevels,
    filterModal,
    applyFilters,
    resetFilters,
  } = useJobs();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const jobListRef = useRef<HTMLDivElement>(null);
  const jobDetailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slug = searchParams.get('slug');
    if (slug) {
      setSelectedSlug(slug);
      fetchJobDetails(slug);
    }
  }, [searchParams]);

  useEffect(() => {
    const jobList = jobListRef.current;
    const jobDetail = jobDetailRef.current;

    const handleJobListWheel = (e: WheelEvent) => {
      if (jobList) {
        e.stopPropagation();
        const { scrollTop, scrollHeight, clientHeight } = jobList;
        const isAtTop = scrollTop === 0 && e.deltaY < 0;
        const isAtBottom =
          scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
    };

    const handleJobDetailWheel = (e: WheelEvent) => {
      if (jobDetail) {
        e.stopPropagation();
        const { scrollTop, scrollHeight, clientHeight } = jobDetail;
        const isAtTop = scrollTop === 0 && e.deltaY < 0;
        const isAtBottom =
          scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
    };

    if (jobList) {
      jobList.addEventListener('wheel', handleJobListWheel, { passive: false });
    }

    if (jobDetail) {
      jobDetail.addEventListener('wheel', handleJobDetailWheel, {
        passive: false,
      });
    }

    return () => {
      if (jobList) {
        jobList.removeEventListener('wheel', handleJobListWheel);
      }
      if (jobDetail) {
        jobDetail.removeEventListener('wheel', handleJobDetailWheel);
      }
    };
  }, []);

  const fetchJobDetails = async (slug: string) => {
    try {
      const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
      setSelectedJob(response.data.singleJob);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  };

  const handleCardClick = async (slug: string) => {
    console.log(isMobile);
    if (isMobile) {
      router.push(`/jobs/${slug}`);
    } else {
      await fetchJobDetails(slug);
      router.push(`?slug=${slug}`, { scroll: false });
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div>
      <SearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchInput={handleSearchInput} // Now passes just the value
        onOpenFilterModal={() => setFilterModal(true)}
      />
      <FilterModal
        isOpen={filterModal}
        onClose={() => setFilterModal(false)}
        employmentTypes={employmentTypes}
        experienceLevels={experienceLevels}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 h-full">
          {/* Left: Job List - Hidden Scrollbar */}
          <div
            ref={jobListRef}
            className="space-y-4 overflow-y-auto h-[calc(100vh-2rem)] pr-2"
            style={{
              scrollbarWidth: 'none', // For Firefox
              msOverflowStyle: 'none', // For IE/Edge
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {jobs.map((job) => (
              <div
                key={job._id}
                className="cursor-pointer"
                onClick={() => handleCardClick(job.slug)}
              >
                <JobCard job={job} isSelected={job.slug === selectedSlug} />
              </div>
            ))}
          </div>

          {/* Right: Job Detail - Hidden Scrollbar */}
          <div
            ref={jobDetailRef}
            className="hidden lg:block col-span-2 overflow-y-auto h-[calc(100vh-2rem)] pl-2"
            style={{
              scrollbarWidth: 'none', // For Firefox
              msOverflowStyle: 'none', // For IE/Edge
            }}
          >
            {' '}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {selectedJob ? (
              <JobDetail job={selectedJob} />
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                Select a job to see details
              </div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
