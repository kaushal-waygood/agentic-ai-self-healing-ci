'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
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

  // --- Initial data load based on URL params ---
  useEffect(() => {
    const page = Number(searchParams.get('page') || '1');
    const query = searchParams.get('query') || '';
    const country = searchParams.get('country') || '';
    const city = searchParams.get('city') || '';

    // CHANGED: Dispatch with append: false for initial load
    dispatch(
      getAllJobsRequest({
        page,
        query,
        country,
        city,
        append: false, // Ensures the list is replaced, not appended to
      }),
    );
  }, [dispatch, searchParams]);

  // --- Fetch metadata for filters (No change here) ---
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

  // --- Filter change handler ---
  const handleFilterChange = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      // CHANGED: Dispatch with append: false to reset the list
      const payload = {
        ...reduxFilters,
        ...newFilters,
        page: 1,
        append: false,
      };
      dispatch(getAllJobsRequest(payload));
      setFilterModal(false);
    }, 500),
    [dispatch, reduxFilters],
  );

  // --- Infinite scroll handler ---
  const loadMoreJobs = useCallback(() => {
    if (!loading && pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      // CORRECT: This correctly dispatches with append: true
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
      append: false, // CHANGED: Dispatch with append: false to reset the list
    };
    dispatch(getAllJobsRequest(initialFilters));
    setFilterModal(false);
  }, [dispatch]);

  // REMOVED: handlePageChange is not needed for infinite scroll, but can be added back if you have a pagination component.

  return {
    jobs,
    loading,
    error,
    pagination,
    filters: reduxFilters,
    filterModal,
    employmentTypes,
    experienceLevels,
    setFilterModal,
    handleFilterChange,
    loadMoreJobs,
    resetFilters,
  };
};
