/** @format */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import {
  getRecommendJobsRequest,
  searchJobRequest,
} from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';

export const useJobs = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  // Guard to prevent multiple initial calls (Strict Mode / Re-renders)
  const hasFetchedInitial = useRef(false);

  const {
    jobs,
    loading,
    error,
    filters: reduxFilters,
    pagination,
    notification,
  } = useSelector((state: RootState) => state.jobs);

  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);

  // 1. Helper to check if URL filters are empty
  const isEmptyFilters = useCallback((filters: any) => {
    return (
      !filters.query &&
      !filters.country &&
      !filters.state &&
      !filters.city &&
      !filters.datePosted &&
      filters.employmentType.length === 0 &&
      filters.experience.length === 0
    );
  }, []);

  // 2. Main Job Fetching Logic
  useEffect(() => {
    // Extract filters from current URL
    const filtersFromUrl = {
      query: searchParams.get('query') || searchParams.get('q') || '',
      country: searchParams.get('country') || '',
      state: searchParams.get('state') || '',
      city: searchParams.get('city') || '',
      datePosted: searchParams.get('datePosted') || '',
      employmentType: searchParams.get('employmentType')?.split(',') || [],
      experience: searchParams.get('experience')?.split(',') || [],
      education: [],
    };

    const isDashboard = pathName === '/dashboard/search-jobs';
    const isPublicSearch = pathName === '/search-jobs';
    const empty = isEmptyFilters(filtersFromUrl);

    // Logic: Only run if we haven't fetched for this specific mount/path combo
    // and we aren't already loading.
    if (!loading && !hasFetchedInitial.current) {
      if (isDashboard) {
        if (empty) {
          dispatch(getRecommendJobsRequest());
        } else {
          dispatch(
            searchJobRequest({ ...filtersFromUrl, page: 1, append: false }),
          );
        }
        hasFetchedInitial.current = true;
      } else if (isPublicSearch) {
        dispatch(
          searchJobRequest({ ...filtersFromUrl, page: 1, append: false }),
        );
        hasFetchedInitial.current = true;
      }
    }

    // Reset the guard only if the pathname changes (e.g., navigating between pages)
    return () => {
      // Optional: keep false if you want it to refetch when returning to the page
      // hasFetchedInitial.current = false;
    };
  }, [dispatch, pathName, searchParams, loading, isEmptyFilters]);

  // 3. Fetch Metadata (Mocked as requested)
  useEffect(() => {
    const fetchJobMetadata = () => {
      const emply = [
        'Full-time',
        'Part-time',
        'Contract',
        'Internship',
        'Freelance',
        // 'Temporary',
        // 'Seasonal',
        // 'Hourly',
        // 'Commission',
        // 'Piecework',
        // 'Other',
      ];
      const exp = [
        'Entry level',
        'Mid level',
        'Senior level',
        'Executive level',
        'Managerial level',
        'Professional level',
        'Technical level',
        'Other',
      ];
      setEmploymentTypes(emply);
      setExperienceLevels(exp);
    };
    fetchJobMetadata();
  }, []);

  // 4. Debounced Search Logic
  const latestFiltersRef = useRef(reduxFilters);
  useEffect(() => {
    latestFiltersRef.current = reduxFilters;
  }, [reduxFilters]);

  const debouncedSearch = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      const payload = { ...latestFiltersRef.current, ...newFilters };
      dispatch(
        searchJobRequest({
          ...payload,
          page: 1,
          append: false,
        }),
      );
    }, 500),
    [dispatch],
  );

  const handleFilterChange = (newFilters: Partial<typeof reduxFilters>) => {
    debouncedSearch(newFilters);
  };

  // 5. Pagination Logic
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
    notification,
    employmentTypes,
    experienceLevels,
    filterModal,
    setFilterModal,
    handleFilterChange,
    loadMoreJobs,
  };
};
