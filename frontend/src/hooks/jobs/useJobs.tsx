'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { getAllJobsRequest } from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import apiInstance from '@/services/api';

export const useJobs = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const {
    jobs,
    loading,
    error,
    pagination,
    filters: reduxFilters,
  } = useSelector((state: RootState) => state.jobs);

  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);

  useEffect(() => {
    const page = Number(searchParams.get('page') || '1');
    const query = searchParams.get('query') || '';
    const country = searchParams.get('country') || '';
    const city = searchParams.get('city') || '';
    dispatch(
      getAllJobsRequest({
        ...reduxFilters,
        page,
        query,
        country,
        city,
      }),
    );
  }, [dispatch, searchParams]);

  // --- Fetch metadata for filters (runs only once) ---
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

  // --- (Unified) Handler for all filter changes ---
  const handleFilterChange = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      // Merge new changes with existing filters and always reset to page 1
      const updatedFilters = { ...reduxFilters, ...newFilters, page: 1 };
      dispatch(getAllJobsRequest(updatedFilters));
      setFilterModal(false); // Close modal if it's open
    }, 500),
    [dispatch, reduxFilters],
  );

  // --- Page change handler ---
  const handlePageChange = useCallback(
    (page: number) => {
      const updatedFilters = { ...reduxFilters, page };
      dispatch(getAllJobsRequest(updatedFilters));
      // You can add logic here to scroll the job list to the top
      document.querySelector('.lg\\:col-span-5 > div')?.scrollTo(0, 0);
    },
    [dispatch, reduxFilters],
  );

  // --- Infinite scroll handler ---
  const loadMoreJobs = useCallback(() => {
    if (!loading && pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      dispatch(
        getAllJobsRequest({ ...reduxFilters, page: nextPage, append: true }),
      );
    }
  }, [dispatch, loading, pagination, reduxFilters]);

  // --- Reset all filters ---
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

  return {
    // State
    jobs,
    loading,
    error,
    pagination,
    filters: reduxFilters,
    filterModal,
    employmentTypes,
    experienceLevels,

    // Handlers
    setFilterModal,
    handleFilterChange,
    handlePageChange,
    loadMoreJobs,
    resetFilters,
  };
};
