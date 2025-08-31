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
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { getStudentJobPreferenceRequest } from '@/redux/reducers/studentReducer';
import { Loader2, Search } from 'lucide-react';
import { Pagination } from '@/components/utils/Pagination';

export default function JobsPage() {
  const {
    jobs,
    loading,
    error,
    pagination,
    loadMoreJobs, // Use this for infinite scroll
    filters,
    setFilterModal,
    employmentTypes,
    experienceLevels,
    filterModal,
    handleSearchChange,
    handlePageChange,
    resetFilters,
  } = useJobs();

  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Ref for the Intersection Observer to target the loader at the bottom
  const observerRef = useRef(null);

  const fetchJobDetails = async (slug: string) => {
    try {
      setSelectedJob(null); // Clear previous job to show a loading state
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

  // Redux logic
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getStudentJobPreferenceRequest());
  }, [dispatch]);

  // Auto-select first job on desktop
  useEffect(() => {
    if (!isMobile && jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, isMobile]);

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (
        target.isIntersecting &&
        !loading &&
        pagination.page < pagination.totalPages
      ) {
        loadMoreJobs();
      }
    },
    [loading, pagination, loadMoreJobs],
  );

  // Effect to set up and clean up the Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 1.0,
    });

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [handleObserver]);

  if (error)
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg">
            Discover opportunities that match your skills and aspirations
          </p>
        </div>

        <SearchFilters
          initialFilters={filters}
          onSearchChange={handleSearchChange}
          onOpenFilterModal={() => setFilterModal(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <div className="space-y-1 h-[calc(100vh-220px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
              {/* Initial page loading state */}
              {loading && pagination.page === 1
                ? Array.from({ length: 5 }).map((_, index) => (
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

              {/* Loader element for the observer to watch */}
              <div ref={observerRef} className="flex justify-center p-4">
                {loading && pagination.page > 1 && (
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
              {selectedJob ? (
                <JobDetail job={selectedJob} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-gray-200">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-16 h-16 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Select a job to view details
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Click on any position to see detailed information.
                  </p>
                </div>
              )}
            </div>
          </div>
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

        <FilterModal
          isOpen={filterModal}
          onClose={() => setFilterModal(false)}
          employmentTypes={employmentTypes}
          experienceLevels={experienceLevels}
          filters={filters}
          onFilterChange={handleSearchChange}
          onReset={resetFilters}
          onApply={() => setFilterModal(false)}
        />
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #3b82f6);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
