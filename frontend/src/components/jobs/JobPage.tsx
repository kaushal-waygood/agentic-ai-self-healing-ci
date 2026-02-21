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
import { toast } from '@/hooks/use-toast';
import { postStudentEventsRequest } from '@/redux/reducers/studentReducer';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import OnboardingExperienceFeedback from '@/app/(app)/dashboard/onboarding-tour/OnboardingExperienceFeedback';
import { FilterPills } from './FilterPills';
import { Loader } from '../Loader';

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
  const dispatch = useDispatch();

  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobLoading, setIsJobLoading] = useState(false);
  const searchParams = useSearchParams();

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
      const payload: any = { jobId, type: 'VIEW' };
      if (query) payload.query = query;

      dispatch(postStudentEventsRequest(payload));
    } catch {
      // analytics must never break UX
    }
  }

  useEffect(() => {
    const slug = searchParams.get('job');
    if (slug) {
      fetchJobDetails(slug);
    }
  }, [searchParams, fetchJobDetails]);

  const handleCardClick = (job: any) => {
    if (selectedJob?._id === job._id) return;

    trackJobClick(job._id, filters?.q);

    if (isMobile) {
      router.push(`/jobs/${job.slug}`);
    } else {
      setSelectedJob(job);

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

  const fromOnboarding = searchParams.get('from') === 'onboarding';

  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!fromOnboarding) return;

    const alreadyDone = localStorage.getItem('onboarding_feedback_done');
    if (!alreadyDone) {
      setShowFeedback(true);
    }
  }, [fromOnboarding]);

  // Inside JobsPage component
  const removeFilter = (key: string, value?: any) => {
    const newFilters = { ...filters };

    if (key === 'clearAll') {
      handleFilterChange({
        ...filters,
        country: '',
        state: '',
        datePosted: '',
        employmentType: [],
        experience: [],
      });
      return;
    }

    if (key === 'employmentType') {
      newFilters.employmentType = newFilters.employmentType.filter(
        (t: string) => t !== value,
      );
    } else if (key === 'country') {
      newFilters.country = '';
      newFilters.state = ''; // Reset state if country is removed
    } else {
      newFilters[key] = '';
    }

    handleFilterChange(newFilters);
  };
  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 pt-1">
      <div className="xl:container mx-auto px-1">
        {showFeedback && (
          <OnboardingExperienceFeedback
            onClose={() => setShowFeedback(false)}
          />
        )}
        <SearchFilters
          initialFilters={filters}
          onSearchChange={handleFilterChange}
          onOpenFilterModal={() => setFilterModal(true)}
        />

        <FilterPills filters={filters} onRemove={removeFilter} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <div>
            <div
              ref={jobListRef}
              className="space-y-2 h-[calc(100vh-180px)] overflow-y-auto px-4 py-2 scrollbar-thin"
            >
              {/* Notification state */}
              {notification && !loading && (
                <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg border">
                  <Frown className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-semibold">{notification}</p>
                </div>
              )}

              {loading && jobs.length === 0 && (
                <Loader message="Loading Jobs" fullHeight={true} />
              )}

              {/* ❌ No Jobs Found UI */}
              {!loading && !notification && jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border ">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Frown className="w-7 h-7 text-gray-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    No jobs found
                  </h3>

                  <p className="text-sm text-gray-500 max-w-xs">
                    Try adjusting your filters or search criteria to see more
                    results.
                  </p>
                </div>
              )}

              {/* Job list */}
              {!notification &&
                jobs.map((job: any) => (
                  <JobCard
                    key={job._id || job.jobId}
                    job={job}
                    id={job._id || job.jobId}
                    isActive={selectedJob?._id === job._id}
                    onClick={() => handleCardClick(job)}
                  />
                ))}

              {/* Infinite loading */}
              {loading && jobs.length > 0 && <JobCardSkeleton />}

              <div ref={observerRef} style={{ height: '1px' }} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin">
              {isJobLoading ? (
                <Loader message="Loading Job data..." fullHeight={true} />
              ) : selectedJob ? (
                <JobDetail job={selectedJob} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 bg-white border rounded-lg text-center">
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
