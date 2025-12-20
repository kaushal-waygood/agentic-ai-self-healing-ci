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
  const [isJobLoading, setIsJobLoading] = useState(false);

  /* ===================== JOB DETAILS (NO ANALYTICS HERE) ===================== */
  const fetchJobDetails = useCallback(async (slug: string) => {
    try {
      setIsJobLoading(true);
      setSelectedJob(null);

      const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
      if (response.data?.singleJob) {
        setSelectedJob(response.data.singleJob);
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    } finally {
      setIsJobLoading(false);
    }
  }, []);

  /* ===================== CLICK TRACKING (SINGLE SOURCE) ===================== */
  async function trackJobClick(jobId: string, query?: string) {
    try {
      const payload: any = {};
      if (query) payload.query = query;

      await apiInstance.post(`/jobs/${jobId}/click`, payload);
    } catch {
      // analytics must never break UX
    }
  }

  const handleCardClick = (job: any) => {
    // 1️⃣ Track click immediately
    trackJobClick(job._id, filters?.q);

    // 2️⃣ Navigate or load details
    if (isMobile) {
      router.push(`/jobs/${job.slug}`);
    } else {
      fetchJobDetails(job.slug);
    }
  };

  /* ===================== IMPRESSION TRACKING (SAFE) ===================== */
  useEffect(() => {
    if (!jobs?.length) return;

    const jobIds = jobs.map((j: any) => j._id);

    apiInstance
      .post('/jobs/impression', {
        jobIds,
        query: filters?.q || null,
      })
      .catch(() => {});
  }, [jobs, filters?.q]);

  /* ===================== SCROLL RESET ===================== */
  useEffect(() => {
    jobListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  /* ===================== INFINITE SCROLL ===================== */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasNextPage && !loading) {
          loadMoreJobs();
        }
      },
      { threshold: 1.0 },
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loading, pagination.hasNextPage, loadMoreJobs]);

  if (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error,
    });
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 pt-1">
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
              className="space-y-2 h-[calc(100vh-180px)] overflow-y-auto px-4 py-2 scrollbar-thin"
            >
              {notification && !loading && (
                <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg border">
                  <Frown className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-semibold">{notification}</p>
                </div>
              )}

              {loading &&
                jobs.length === 0 &&
                Array.from({ length: 8 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}

              {!notification &&
                jobs.map((job: any) => (
                  <JobCard
                    key={job._id || job.jobId}
                    job={job}
                    isActive={selectedJob?._id === job._id}
                    onClick={() => handleCardClick(job)}
                  />
                ))}

              {loading && jobs.length > 0 && <JobCardSkeleton />}

              <div ref={observerRef} style={{ height: '1px' }} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin">
              {isJobLoading ? (
                <div className="h-full flex items-center justify-center bg-white border rounded-xl">
                  <p>Loading Job Detail</p>
                </div>
              ) : selectedJob ? (
                <JobDetail job={selectedJob} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 bg-white border rounded-2xl text-center">
                  <Search className="w-12 h-12 text-purple-400 mb-4" />
                  <p className="text-gray-500">
                    {jobs.length
                      ? 'Select a job to view details'
                      : 'Use the search filters above'}
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
