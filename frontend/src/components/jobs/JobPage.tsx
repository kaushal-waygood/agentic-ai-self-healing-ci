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
import {
  Search,
  Frown,
  FileText,
  Target,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { postStudentEventsRequest } from '@/redux/reducers/studentReducer';
import { useDispatch } from 'react-redux';
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
    employmentTypes,
    experienceLevels,
  } = useJobs();
  const dispatch = useDispatch();

  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobLoading, setIsJobLoading] = useState(false);
  const searchParams = useSearchParams();

  // ===================== VIEWED JOB DEDUPLICATION =====================
  const viewedJobsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const stored = localStorage.getItem('viewedJobIds');
    if (stored) {
      try {
        viewedJobsRef.current = new Set(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse viewedJobIds', e);
      }
    }
  }, []);

  const markJobViewed = useCallback((jobId: string) => {
    viewedJobsRef.current.add(jobId);
    localStorage.setItem(
      'viewedJobIds',
      JSON.stringify(Array.from(viewedJobsRef.current)),
    );
  }, []);
  /* ===================== JOB DETAILS (NO ANALYTICS HERE) ===================== */
  const fetchJobDetails = useCallback(async (slug: string) => {
    try {
      setIsJobLoading(true);
      // setSelectedJob(null);

      const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
      if (response.data?.singleJob) {
        setSelectedJob(response.data.singleJob);
        return response.data.singleJob;
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    } finally {
      setIsJobLoading(false);
    }
  }, []);

  /* ===================== CLICK TRACKING (SINGLE SOURCE) ===================== */
  const trackJobClick = useCallback(
    async (jobId: string, query?: string) => {
      if (viewedJobsRef.current.has(jobId)) return;

      try {
        const payload: any = { jobId, type: 'VIEW' };
        if (query) payload.query = query;

        dispatch(postStudentEventsRequest(payload));
        markJobViewed(jobId);
      } catch {
        // analytics must never break UX
      }
    },
    [dispatch, markJobViewed],
  );

  // ===================== HANDLE JOB FROM URL =====================
  useEffect(() => {
    const slug = searchParams.get('job');
    if (slug) {
      fetchJobDetails(slug).then((job) => {
        if (job) {
          trackJobClick(job._id, filters?.q);
        }
      });
    }
  }, [searchParams, fetchJobDetails, filters?.q, trackJobClick]);

  const handleCardClick = useCallback(
    (job: any) => {
      if (selectedJob?._id === job._id) return;

      trackJobClick(job._id, filters?.q);

      if (isMobile) {
        router.push(`/jobs/${job.slug}`);
      } else {
        setSelectedJob(job);
        fetchJobDetails(job.slug);
      }
    },
    [selectedJob, filters?.q, isMobile, router, fetchJobDetails, trackJobClick],
  );

  /* ===================== IMPRESSION TRACKING (SAFE) ===================== */
  useEffect(() => {
    if (!jobs?.length) return;

    const jobIds = jobs.map((j: any) => j._id || j.jobId).filter(Boolean);

    apiInstance
      .post('/jobs/impression', {
        jobIds,
        query: filters?.q || null,
      })
      .catch(() => {});
  }, [jobs, filters?.q]);

  /* ===================== SCROLL RESET + CLEAR STALE DETAIL ===================== */
  useEffect(() => {
    jobListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedJob(null);
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasNextPage && !loading) {
          loadMoreJobs();
        }
      },
      {
        rootMargin: '400px',
        threshold: 0,
      },
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loading, pagination.hasNextPage, loadMoreJobs]);

  const fromOnboarding = searchParams.get('from') === 'onboarding';

  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!fromOnboarding) return;

    const alreadyDone = localStorage.getItem('onboarding_feedback_done');
    if (!alreadyDone) {
      setShowFeedback(true);
    }
  }, [fromOnboarding]);

  /* ===================== AUTO-SELECT FIRST JOB ===================== */
  // 1. Create a ref to track if we've already done the initial auto-selection
  const hasAutoSelected = useRef(false);

  // 2. Reset the ref whenever the jobs list changes significantly (like a new search)
  useEffect(() => {
    hasAutoSelected.current = false;
  }, [filters]);

  // 3. Updated selection logic
  useEffect(() => {
    if (
      !isMobile &&
      jobs?.length > 0 &&
      !loading &&
      !hasAutoSelected.current &&
      !searchParams.get('job')
    ) {
      const firstJob = jobs[0];
      handleCardClick(firstJob);
      hasAutoSelected.current = true;
    }
  }, [jobs, isMobile, loading, searchParams, handleCardClick]);

  const removeFilter = (key: string, value?: any) => {
    if (key === 'clearAll') {
      handleFilterChange({
        ...filters, // Keep existing values (including 'q')
        country: '',
        state: '',
        datePosted: '',
        employmentType: [],
        experience: [],
      });
      return;
    }

    // Logic for individual pill removal
    const newFilters = { ...filters };

    if (key === 'employmentType') {
      newFilters.employmentType = (newFilters.employmentType || []).filter(
        (t: string) => t !== value,
      );
    } else if (key === 'country') {
      // If country is removed, state must be cleared as well
      newFilters.country = '';
      newFilters.state = '';
    } else if (key === 'state') {
      newFilters.state = '';
    } else {
      // Generic reset for other string-based filters (like datePosted)
      newFilters[key] = '';
    }

    handleFilterChange(newFilters);
  };
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
              className="space-y-2 h-[calc(100vh-180px)] overflow-y-auto px-4 py-2 no-scrollbar"
            >
              {/* Notification state */}
              {notification && !loading && (
                <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg border">
                  <Frown className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-semibold">{notification}</p>
                </div>
              )}

              {/* 🚀 Active AI Processing State */}
              {loading && jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] px-6 text-center animate-in fade-in zoom-in duration-500">
                  <div className="relative mb-8">
                    {/* Outer spinning ring */}
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    {/* Inner Icon */}
                    <Search className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 mb-3">
                    Fetching the best jobs for you...
                  </h2>

                  <div className="space-y-4 max-w-sm">
                    <p className="text-slate-600 font-medium">
                      Wait just 5s while our AI scans the internet to find your
                      perfect match.
                    </p>

                    <div className="flex flex-col gap-2 text-sm text-slate-500 bg-white/50 p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Searching 100+ job boards...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>Preparing to generate your 1-click CV & CL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>Drafting personalized application emails</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ❌ Left Side Search Prompt / No Results UI */}
              {!loading && !notification && jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                  {/* Visual Icon */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 scale-150"></div>
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                      <Search className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  {/* Message Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Find your next opportunity
                  </h3>

                  <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed mb-6">
                    Enter a job title, company, or keywords in the search bar
                    above to see results.
                  </p>

                  {/* Quick Helper Links */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="text-[11px] font-medium px-3 py-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                      Try "Developer"
                    </span>
                    <span className="text-[11px] font-medium px-3 py-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                      Try "Design"
                    </span>
                  </div>
                </div>
              )}
              {/* Job list */}
              {!notification &&
                jobs.map((job: any) => (
                  <JobCard
                    key={job._id || job.jobId || job.slug}
                    job={job}
                    id={job._id || job.jobId}
                    isActive={
                      !!selectedJob &&
                      (selectedJob.slug === job.slug ||
                        (selectedJob._id && selectedJob._id === job._id))
                    }
                    onClick={() => handleCardClick(job)}
                  />
                ))}

              {/* Infinite loading */}
              {loading && jobs.length > 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-700 font-semibold">
                    Load More Jobs Just for you
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Our AI is preparing your tailored CV and Cover Letter
                    draft...
                  </p>
                </div>
              )}

              {/* <div ref={observerRef} style={{ height: '1px' }} /> */}
              <div ref={observerRef} className="h-4 w-full" />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin">
              {isJobLoading ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-700 font-semibold">
                    Analyzing Job Requirements
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Our AI is preparing your tailored CV and Cover Letter
                    draft...
                  </p>
                </div>
              ) : selectedJob ? (
                <JobDetail job={selectedJob} />
              ) : (
                /* --- NEW EMPTY STATE UI --- */
                <div className="flex flex-col items-center justify-center h-full p-10 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl text-center relative overflow-hidden">
                  {/* Floating Icon Composition */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center relative z-10">
                      <Briefcase className="w-10 h-10 text-blue-400" />
                    </div>
                  </div>

                  {/* Dynamic Heading & Copy */}
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">
                    {jobs.length
                      ? 'Ready to dive in?'
                      : 'Find your next great role'}
                  </h3>
                  <p className="text-slate-500 max-w-sm mb-10 relative z-10 leading-relaxed">
                    {jobs.length
                      ? 'Select a position from the list to explore the role, analyze requirements, and let our AI tailor your application.'
                      : "Use the search filters above to explore opportunities. Once you find a match, we'll help you craft the perfect application."}
                  </p>

                  {/* App Feature Highlights (Fills empty space and builds excitement) */}
                  <div className="flex flex-wrap justify-center gap-3 w-full max-w-md relative z-10">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-slate-600 border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      AI Cover Letters
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-slate-600 border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Tailored CVs
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-slate-600 border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Smart Matching
                    </div>
                  </div>
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
          handleFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
}
