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

  const isEmptyFilters = (filters: any) => {
    const {
      query,
      country,
      state,
      city,
      datePosted,
      employmentType,
      experience,
      education,
    } = filters;

    return (
      !query &&
      !country &&
      !state &&
      !city &&
      !datePosted &&
      (!employmentType || employmentType.length === 0) &&
      (!experience || experience.length === 0) &&
      (!education || education.length === 0)
    );
  };

  const {
    jobs,
    loading,
    error,
    filters: reduxFilters,
    pagination,
    notification, // assuming this exists in your jobs slice
  } = useSelector((state: RootState) => state.jobs);

  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);

  useEffect(() => {
    const filtersFromUrl = {
      query: searchParams.get('query') || '',
      country: searchParams.get('country') || '',
      state: searchParams.get('state') || '',
      city: searchParams.get('city') || '',
      datePosted: searchParams.get('datePosted') || '',
      employmentType: searchParams.get('employmentType')
        ? searchParams.get('employmentType')!.split(',')
        : [],
      experience: searchParams.get('experience')
        ? searchParams.get('experience')!.split(',')
        : [],
      education: [], // URL not handling this yet, so keep empty for now
    };

    const query = searchParams.get('q');
    if (query) {
      filtersFromUrl.query = query;
    }

    if (pathName === '/dashboard/search-jobs' || pathName === '/search-jobs') {
      if (isEmptyFilters(filtersFromUrl)) {
        dispatch(getRecommendJobsRequest());
      } else {
        dispatch(
          searchJobRequest({ ...filtersFromUrl, page: 1, append: false }),
        );
      }
    } else if (pathName === '/search-jobs') {
      dispatch(searchJobRequest({ ...filtersFromUrl, page: 1, append: false }));
    }
  }, [dispatch, searchParams, pathName]);

  // Fetch metadata
  useEffect(() => {
    const fetchJobMetadata = async () => {
      try {
        // const [typesResponse, levelsResponse] = await Promise.all([
        //   apiInstance.get('/jobs/employment-types'),
        //   apiInstance.get('/jobs/experience-levels'),
        // ]);

        const emply = [
          'Full-time',
          'Part-time',
          'Contract',
          'Internship',
          'Freelance',
          'Temporary',
          'Seasonal',
          'Hourly',
          'Commission',
          'Piecework',
          'Other',
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
      } catch (err) {
        console.error('Failed to fetch job metadata:', err);
      }
    };
    fetchJobMetadata();
  }, []);

  // Keep latest filters in a ref for debounce
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
