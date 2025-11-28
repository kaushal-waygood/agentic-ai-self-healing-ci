// JobsPage.tsx

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { JobCard, JobCardSkeleton } from '@/components/jobs/job-card';
import JobDetail from '@/components/jobs/JobDetail';
import { useJobs } from '@/hooks/jobs/useJobs';
import { useMediaQuery } from '@/hooks/jobs/useMediaQuery';
import { useRouter } from 'next/navigation';
import apiInstance from '@/services/api';
import { FilterModal } from './FilterModal';
import { SearchFilters } from './SearchFilters';
import { Search, Frown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function JobsPage() {
  const jobListRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    jobs,
    loading,
    error,
    filters,
    pagination,
    filterModal,
    setFilterModal,
    handleFilterChange,
    notification,
    loadMoreJobs,
  } = useJobs();

  const router = useRouter();
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

  useEffect(() => {
    jobListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

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
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error,
    });
  }

  return (
    <div className=" bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 pt-1">
      <div className="xl:container mx-auto px-1">
        <SearchFilters
          initialFilters={filters}
          onSearchChange={handleFilterChange}
          onOpenFilterModal={() => setFilterModal(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <div>
            <div
              ref={jobListRef}
              className="space-y-2 h-[calc(100vh-180px)] overflow-y-auto px-4 py-2 scrollbar-thin "
            >
              {notification && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white rounded-lg border">
                  <Frown className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-semibold">{notification}</p>
                </div>
              )}

              {loading &&
                jobs.length === 0 &&
                Array.from({ length: 8 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}

              {!notification &&
                jobs.map((job: any) => (
                  <JobCard
                    key={job._id || job.jobId}
                    job={job}
                    isActive={selectedJob?._id === job._id}
                    onClick={() => handleCardClick(job.slug)}
                  />
                ))}

              {loading && jobs.length > 0 && (
                <JobCardSkeleton key="loading-skeleton" />
              )}

              <div ref={observerRef} style={{ height: '1px' }} />
            </div>
          </div>

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

        <FilterModal
          isOpen={filterModal}
          onClose={() => setFilterModal(false)}
        />
      </div>
    </div>
  );
}
