import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import apiInstance from '@/services/api';
import {
  getAllJobsRequest,
  setCurrentPage,
  // resetFilters as resetReduxFilters,
} from '@/redux/reducers/jobReducer';
import debounce from 'debounce';
import { Job } from '@/redux/types/jobType';

type FilterState = {
  page: number;
  query: string;
  country: string;
  city: string;
  datePosted: string;
  employmentType: string[];
  experience: string[];
  append?: boolean; // For infinite scroll
};

export const useJobs = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redux state
  const {
    jobs,
    loading,
    error,
    pagination,
    filters: reduxFilters,
  } = useSelector((state: RootState) => state.jobs);

  // Local state
  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const jobListRef = useRef<HTMLDivElement>(null);
  const jobDetailRef = useRef<HTMLDivElement>(null);

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

  const handleFilterChange = useCallback(
    debounce((newFilters: Partial<FilterState>) => {
      // Merge new changes with existing filters from Redux and reset to page 1
      const updatedFilters = { ...reduxFilters, ...newFilters, page: 1 };
      dispatch(getAllJobsRequest(updatedFilters));
    }, 500),
    [dispatch, reduxFilters],
  );

  // Fetch jobs on initial mount or when page changes
  useEffect(() => {
    const page = Number(searchParams.get('page') || '1');
    dispatch(setCurrentPage(page));
    dispatch(
      getAllJobsRequest({
        page,
        query: '', // Clean search
        country: '',
        city: '',
        datePosted: '',
        employmentType: [],
        experience: [],
      }),
    );
  }, [dispatch, searchParams]);

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const jobId = searchParams.get('slug');
        if (jobId) {
          const response = await apiInstance.get(`/jobs/find?slug=${jobId}`);
          setSelectedJob(response.data.singleJob);
        }
      } catch (err) {
        console.error('Failed to fetch single job:', err);
      }
    };

    if (searchParams.has('slug')) {
      fetchSingleJob();
    }
  }, []);

  // Search input (does not update URL)
  const handleSearchInput = useCallback(
    async (value: string) => {
      // Just call API or dispatch if needed — avoid query param
      dispatch(
        getAllJobsRequest({
          page: 1,
          query: value,
          country: '',
          city: '',
          datePosted: '',
          employmentType: [],
          experience: [],
        }),
      );
    },
    [dispatch],
  );

  // Page change — only modify `page` in URL
  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
      dispatch(getAllJobsRequest({ ...reduxFilters, page }));
      // Scroll to the top of the job list
      document.querySelector('.lg\\:col-span-5 > div')?.scrollTo(0, 0);
    },
    [dispatch, reduxFilters],
  );

  const loadMoreJobs = useCallback(() => {
    if (!loading && pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      dispatch(
        getAllJobsRequest({ ...reduxFilters, page: nextPage, append: true }),
      );
    }
  }, [dispatch, loading, pagination, reduxFilters]);

  // Filter change — does not touch URL
  const applySearchFilters = useCallback(
    (newFilters: { [key: string]: string | string[] }) => {
      dispatch(
        getAllJobsRequest({
          page: 1,
          query: '',
          country: '',
          city: '',
          datePosted: '',
          employmentType: newFilters.employmentType || [],
          experience: newFilters.experience || [],
        }),
      );
      setFilterModal(false);
    },
    [dispatch],
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    const initialFilters = {
      page: 1,
      query: '',
      country: '',
      city: '',
      datePosted: '',
      employmentType: [],
      experience: [],
    };
    dispatch(getAllJobsRequest(initialFilters));
    setFilterModal(false);
  }, [dispatch]);

  // On job card click, just load the details without modifying URL
  const handleCardClick = useCallback(async (slug: string) => {
    try {
      const response = await apiInstance.get(`/jobs/find?slug=${slug}`);
      setSelectedJob(response.data.singleJob);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  }, []);

  const handleSearchChange = useCallback(
    debounce((filters: FilterState) => {
      dispatch(
        getAllJobsRequest({
          page: 1,
          query: filters.query,
          country: filters.country,
          city: filters.city,
          datePosted: filters.datePosted,
          employmentType: [],
          experience: [],
        }),
      );
    }, 500),
    [dispatch],
  );

  useEffect(() => {
    const page = Number(searchParams.get('page') || '1');
    dispatch(getAllJobsRequest({ ...reduxFilters, page }));
  }, [dispatch]); // Removed searchParams to prevent re-fetching on irrelevant URL changes

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
    handleSearchChange,

    // Handlers
    setFilterModal,
    handleSearchInput,
    handlePageChange,
    applySearchFilters,
    resetFilters,
    handleCardClick,

    handleFilterChange,
    loadMoreJobs,
  };
};
