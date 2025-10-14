'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { fetchJobsStream } from '@/redux/reducers/jobReducer'; // The unified stream action
import { RootState } from '@/redux/rootReducer';
import apiInstance from '@/services/api';

/**
 * A custom hook to manage fetching and filtering job data via an SSE stream.
 * It unifies all data fetching operations (initial load, filtering, reset)
 * into a single streaming action for consistent state management.
 */
export const useJobs = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // --- 1. Select state from Redux store ---
  const {
    jobs,
    loading,
    error,
    filters: reduxFilters,
  } = useSelector((state: RootState) => state.jobs);

  // --- 2. Local state for UI and metadata ---
  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);

  // --- 3. Effect for initial data load based on URL ---
  // This runs on mount and whenever the URL search parameters change.
  useEffect(() => {
    const filtersFromUrl = {
      query: searchParams.get('query') || '',
      country: searchParams.get('country') || '',
      city: searchParams.get('city') || '',
      datePosted: searchParams.get('datePosted') || '',
      employmentType: searchParams.get('employmentType')?.split(',') || [],
      experience: searchParams.get('experience')?.split(',') || [],
    };
    dispatch(fetchJobsStream(filtersFromUrl));
  }, [dispatch, searchParams]);

  // --- 4. Effect to fetch static metadata ---
  // This runs once when the component mounts.
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

  // --- 5. Handlers for user actions ---

  /**
   * Dispatches the stream action with updated filters.
   * Debounced to prevent excessive calls while the user interacts with filters.
   */
  const handleFilterChange = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      const payload = {
        ...reduxFilters,
        ...newFilters,
      };
      dispatch(fetchJobsStream(payload));
      setFilterModal(false);
    }, 500),
    [dispatch, reduxFilters], // Re-create debounce handler if reduxFilters changes
  );

  /**
   * Resets all filters and fetches the full, unfiltered job stream.
   */
  const resetFilters = useCallback(() => {
    const initialFilters = {
      query: '',
      country: '',
      city: '',
      datePosted: '',
      employmentType: [],
      experience: [],
    };
    dispatch(fetchJobsStream(initialFilters));
    setFilterModal(false);
  }, [dispatch]);

  // --- 6. Return values for the component ---
  return {
    // Data
    jobs,
    loading,
    error,
    filters: reduxFilters,

    // Metadata
    employmentTypes,
    experienceLevels,

    // UI State
    filterModal,
    setFilterModal,

    // Handlers
    handleFilterChange,
    resetFilters,
  };
};
