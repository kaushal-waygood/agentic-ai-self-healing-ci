'use client';

import { useState, useEffect, useCallback, useRef } from 'react'; // 1. Import useRef
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { searchJobRequest } from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import apiInstance from '@/services/api';

export const useJobs = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const {
    jobs,
    loading,
    error,
    filters: reduxFilters,
    pagination,
  } = useSelector((state: RootState) => state.jobs);

  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);

  // Effect for the initial data load based on URL parameters
  useEffect(() => {
    const filtersFromUrl = {
      query: searchParams.get('query') || '',
      country: searchParams.get('country') || '',
      state: searchParams.get('state') || '',
      city: searchParams.get('city') || '',
      datePosted: searchParams.get('datePosted') || '',
      employmentType: searchParams.get('employmentType')?.split(',') || [],
      experience: searchParams.get('experience')?.split(',') || [],
    };
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

  // ✅ --- THE FIX --- ✅

  // 2. Create a ref to hold the latest filters. This doesn't trigger re-renders.
  const latestFiltersRef = useRef(reduxFilters);

  // Keep the ref updated with the latest filters from Redux on every render.
  useEffect(() => {
    latestFiltersRef.current = reduxFilters;
  });

  // 3. Create the debounced function *outside* of useCallback, but wrapped in useCallback
  //    with an empty dependency array [], so it is created only ONCE.
  const debouncedSearch = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      // Use the ref to get the most up-to-date filters when the debounce fires.
      const payload = { ...latestFiltersRef.current, ...newFilters };
      dispatch(searchJobRequest({ ...payload, page: 1, append: false }));
    }, 500),
    [dispatch], // dispatch is stable and won't cause re-creation
  );

  // 4. Expose a stable handler that calls the debounced function.
  const handleFilterChange = (newFilters: Partial<typeof reduxFilters>) => {
    debouncedSearch(newFilters);
  };

  // --- END OF FIX ---

  const loadMoreJobs = useCallback(() => {
    if (loading || !pagination.hasNextPage) return;
    dispatch(
      searchJobRequest({
        ...reduxFilters,
        page: pagination.currentPage + 1,
        append: true,
      }),
    );
  }, [dispatch, loading, pagination, reduxFilters]);

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
    handleFilterChange, // Expose the new stable handler
    loadMoreJobs,
  };
};
