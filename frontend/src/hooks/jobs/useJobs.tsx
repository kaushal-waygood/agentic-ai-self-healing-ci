import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import apiInstance from '@/services/api';
import {
  getAllJobsRequest,
  setCurrentPage,
  resetFilters as resetReduxFilters,
} from '@/redux/reducers/jobReducer';
import { Job } from '@/redux/types/jobType';

export const useJobs = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get state from Redux
  const {
    jobs,
    loading,
    error,
    pagination,
    filters: reduxFilters,
  } = useSelector((state: any) => state.jobs);

  // Local state
  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const jobListRef = useRef<HTMLDivElement>(null);
  const jobDetailRef = useRef<HTMLDivElement>(null);

  // Fetch job details
  const fetchJobDetails = useCallback(async (slug: string) => {
    try {
      const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
      setSelectedJob(response.data.singleJob);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  }, []);

  // Handle URL changes
  useEffect(() => {
    const slug = searchParams.get('slug');
    if (slug) {
      fetchJobDetails(slug);
    }
  }, [searchParams, fetchJobDetails]);

  // Initialize filters from URL
  useEffect(() => {
    const page = searchParams.get('page') || '1';
    const query = searchParams.get('query') || '';
    const country = searchParams.get('country') || '';
    const city = searchParams.get('city') || '';
    const datePosted = searchParams.get('datePosted') || '';
    const employmentType = searchParams.get('employmentType')?.split(',') || [];
    const experience = searchParams.get('experience')?.split(',') || [];

    dispatch(setCurrentPage(Number(page)));
    dispatch(
      getAllJobsRequest({
        page: Number(page),
        query,
        country,
        city,
        datePosted,
        employmentType,
        experience,
      }),
    );
  }, [dispatch, searchParams]);

  // Fetch metadata
  useEffect(() => {
    const fetchJobMetadata = async () => {
      try {
        const [typesResponse, levelsResponse] = await Promise.all([
          apiInstance.get('/jobs/employment-types'),
          apiInstance.get('/jobs/experience-levels'),
        ]);
        setEmploymentTypes(typesResponse.data.jobTypes);
        setExperienceLevels(levelsResponse.data.experiences);
      } catch (err) {
        console.error('Failed to fetch job metadata:', err);
      }
    };

    fetchJobMetadata();
  }, []);

  // Handle search input with debouncing
  const handleSearchInput = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('query', value);
      params.set('page', '1');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (name: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString());

      if (Array.isArray(value)) {
        params.set(name, value.join(','));
      } else {
        params.set(name, value);
      }

      params.set('page', '1');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Apply filters
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`?${params.toString()}`);
    setFilterModal(false);
  }, [router, searchParams]);

  // Reset filters
  const resetAllFilters = useCallback(() => {
    dispatch(resetReduxFilters());
    router.push('?page=1');
    setFilterModal(false);
  }, [dispatch, router]);

  // Pagination
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Handle job card click
  const handleCardClick = useCallback(
    async (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('slug', slug);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return {
    // State
    filterModal,
    filters: reduxFilters,
    employmentTypes,
    experienceLevels,
    jobs,
    loading,
    error,
    pagination,
    selectedJob,

    // Refs
    jobListRef,
    jobDetailRef,

    // Handlers
    setFilterModal,
    handleFilterChange,
    handleSearchInput,
    handlePageChange,
    applyFilters,
    resetFilters: resetAllFilters,
    handleCardClick,
  };
};
