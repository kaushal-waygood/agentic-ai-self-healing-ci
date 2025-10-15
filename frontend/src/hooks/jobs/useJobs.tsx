'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { searchJobRequest } from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import apiInstance from '@/services/api';

export const useJobs = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Select all necessary state from Redux, including pagination
  const {
    jobs,
    loading,
    error,
    filters: reduxFilters,
    pagination,
  } = useSelector((state: RootState) => state.jobs);

  // Local state for UI elements
  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);

  // Effect for the initial data load based on URL parameters
  useEffect(() => {
    const filtersFromUrl = {
      query: searchParams.get('query') || '',
      country: searchParams.get('country') || '',
      city: searchParams.get('city') || '',
      datePosted: searchParams.get('datePosted') || '',
      employmentType: searchParams.get('employmentType')?.split(',') || [],
      experience: searchParams.get('experience')?.split(',') || [],
    };
    // Dispatch with the full payload for a new search on page 1
    dispatch(searchJobRequest({ ...filtersFromUrl, page: 1, append: false }));
  }, [dispatch, searchParams]);

  // Effect to fetch static metadata for filters (runs once)
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

  // Handler for applying new filters
  const handleFilterChange = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      const payload = { ...reduxFilters, ...newFilters };
      // Dispatch a new search from page 1 with the updated filters
      dispatch(searchJobRequest({ ...payload, page: 1, append: false }));
      // setFilterModal(false); // <--- REMOVE THIS LINE
    }, 500),
    [dispatch, reduxFilters],
  );

  // Function to load the next page of results for infinite scroll
  const loadMoreJobs = useCallback(() => {
    // Prevent fetching if already loading or if there are no more pages
    if (loading || !pagination.hasNextPage) return;

    dispatch(
      searchJobRequest({
        ...reduxFilters,
        page: pagination.currentPage + 1,
        append: true, // Append new results to the existing list
      }),
    );
  }, [dispatch, loading, pagination, reduxFilters]);

  // Return all state and handlers needed by the component
  return {
    jobs,
    loading,
    error,
    filters: reduxFilters,
    pagination,
    employmentTypes,
    experienceLevels,
    filterModal,
    setFilterModal,
    handleFilterChange,
    loadMoreJobs,
  };
};
