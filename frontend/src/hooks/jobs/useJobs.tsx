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

  const {
    jobs,
    loading,
    error,
    filters: reduxFilters,
    pagination,
    notification,
  } = useSelector((state: RootState) => state.jobs);

  const [filterModal, setFilterModal] = useState(false);
  const [employmentTypes] = useState<string[]>([
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Freelance',
  ]);
  const [experienceLevels] = useState<string[]>([
    'Entry level',
    'Mid level',
    'Senior level',
    'Executive level',
    'Managerial level',
    'Professional level',
    'Technical level',
    'Other',
  ]);

  // Track the last fetch key so identical requests are never duplicated.
  // Key = "<pathName>|<serialized searchParams>"
  const fetchedKeyRef = useRef<string>('');
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // ─── Initial Fetch (fires when URL / path changes) ───────────────────────────
  useEffect(() => {
    const isDashboard = pathName === '/dashboard/search-jobs';
    const isPublicSearch = pathName === '/search-jobs';
    if (!isDashboard && !isPublicSearch) return;

    // 1. EXTRA GUARD: If we are already loading, don't initiate a duplicate call
    if (loadingRef.current) return;

    const q = searchParams.get('query') || searchParams.get('q') || '';
    const country = searchParams.get('country') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const datePosted = searchParams.get('datePosted') || '';
    const employmentType =
      searchParams.get('employmentType')?.split(',').filter(Boolean) ?? [];
    const experience =
      searchParams.get('experience')?.split(',').filter(Boolean) ?? [];

    const isEmpty =
      !q &&
      !country &&
      !state &&
      !city &&
      !datePosted &&
      employmentType.length === 0 &&
      experience.length === 0;

    const key = `${pathName}|${searchParams.toString()}`;

    // 2. STAGE GUARD: Only fire if the URL key has actually changed
    if (fetchedKeyRef.current === key) return;

    // Update ref IMMEDIATELY before dispatching
    fetchedKeyRef.current = key;

    if (isEmpty) {
      dispatch(getRecommendJobsRequest({ page: 1, append: false }));
    } else {
      dispatch(
        searchJobRequest({
          query: q,
          country,
          state,
          city,
          datePosted,
          employmentType,
          experience,
          education: [],
          page: 1,
          append: false,
        }),
      );
    }
    // Remove loading/redux dependencies from the array to prevent the loop
  }, [dispatch, pathName, searchParams]);

  // ─── Debounced search (called by SearchFilters / FilterModal directly) ───────
  const latestFiltersRef = useRef(reduxFilters);
  useEffect(() => {
    latestFiltersRef.current = reduxFilters;
  }, [reduxFilters]);

  // debouncedSearch is stable — it never changes reference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      const payload = { ...latestFiltersRef.current, ...newFilters };
      // Reset the key so the next URL-driven effect can also fire if needed
      fetchedKeyRef.current = '';
      dispatch(
        searchJobRequest({
          ...payload,
          page: 1,
          append: false,
        }),
      );
    }, 500),
    [dispatch], // dispatch is stable
  );

  // handleFilterChange is stable — wrapped in useCallback so SearchFilters
  // does NOT get a new reference on every render (which would cause loops)
  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof reduxFilters>) => {
      debouncedSearch(newFilters);
    },
    [debouncedSearch],
  );

  // ─── Pagination ──────────────────────────────────────────────────────────────
  const hasNextPage =
    pagination?.hasNextPage ??
    (pagination?.page ?? 1) < (pagination?.totalPages ?? 1);

  const loadMoreJobs = useCallback(() => {
    if (loadingRef.current || !hasNextPage) return;

    const currentPage =
      (pagination as any)?.currentPage ?? pagination?.page ?? 1;

    const q = searchParams.get('query') || searchParams.get('q') || '';
    const country = searchParams.get('country') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const datePosted = searchParams.get('datePosted') || '';
    const employmentType =
      searchParams.get('employmentType')?.split(',').filter(Boolean) ?? [];
    const experience =
      searchParams.get('experience')?.split(',').filter(Boolean) ?? [];

    const isDashboard = pathName === '/dashboard/search-jobs';
    const isPublicSearch = pathName === '/search-jobs';

    const isSearchEmpty =
      !q &&
      !country &&
      !state &&
      !city &&
      !datePosted &&
      employmentType.length === 0 &&
      experience.length === 0;

    if ((isDashboard || isPublicSearch) && isSearchEmpty) {
      dispatch(
        getRecommendJobsRequest({
          page: currentPage + 1,
          append: true,
        }),
      );
    } else {
      dispatch(
        searchJobRequest({
          ...reduxFilters,
          page: currentPage + 1,
          append: true,
        }),
      );
    }
  }, [hasNextPage, pagination, dispatch, reduxFilters, pathName, searchParams]);

  return {
    jobs,
    loading,
    error,
    filters: reduxFilters,
    pagination: { ...pagination, hasNextPage },
    notification,
    employmentTypes,
    experienceLevels,
    filterModal,
    setFilterModal,
    handleFilterChange,
    loadMoreJobs,
  };
};
