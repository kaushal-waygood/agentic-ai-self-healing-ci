'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getToken } from '@/hooks/useToken';
import { debounce } from 'lodash';
import {
  getRecommendJobsRequest,
  searchJobRequest,
  setCacheHit,
} from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import { makeCacheKey, getCache } from '@/lib/jobCache';

export const useJobs = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const tokens = getToken();
  const router = useRouter();

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
    // 'Freelance',
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
  const fetchedKeyRef = useRef<string>('');
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading, jobs, pagination]);

  // ─── Helper: extract all URL search params into a consistent object ──────────
  const extractFiltersFromUrl = useCallback(() => {
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

    return {
      q,
      country,
      state,
      city,
      datePosted,
      employmentType,
      experience,
      isEmpty,
    };
  }, [searchParams]);

  // ─── Initial Fetch (fires when URL / path changes) ───────────────────────────
  useEffect(() => {
    const isDashboard = pathName === '/dashboard/search-jobs';
    const isPublicSearch = pathName === '/search-jobs';
    if (!isDashboard && !isPublicSearch) return;

    // EXTRA GUARD: If we are already loading, don't initiate a duplicate call
    if (loadingRef.current) return;

    const {
      q,
      country,
      state,
      city,
      datePosted,
      employmentType,
      experience,
      isEmpty,
    } = extractFiltersFromUrl();

    const key = `${pathName}|${searchParams.toString()}`;

    // STAGE GUARD: Only fire if the URL key has actually changed
    if (fetchedKeyRef.current === key) return;

    // Update ref IMMEDIATELY before dispatching
    fetchedKeyRef.current = key;

    console.log('token', tokens);
    if (isEmpty) {
      // --- UPDATED LOGIC HERE ---
      // Only call Recommended API if the user is authenticated
      if (tokens) {
        const cacheKey = makeCacheKey('recommend', { page: 1 });
        if (getCache(cacheKey)) dispatch(setCacheHit(true));

        dispatch(getRecommendJobsRequest({ page: 1, append: false }));
      } else {
        // OPTIONAL: If no token and no search query,
        // you could either do nothing or call searchJobRequest with
        // a empty/default query to show general jobs
        console.log('No token found, skipping recommendations.');
      }
    } else {
      const payload = {
        query: q,
        country,
        state,
        city,
        datePosted,
        employmentType,
        experience,
        education: [] as string[],
        page: 1,
        append: false,
      };
      const cacheKey = makeCacheKey('search', payload);
      if (getCache(cacheKey)) dispatch(setCacheHit(true));
      dispatch(searchJobRequest(payload));
    }
  }, [dispatch, pathName, searchParams, extractFiltersFromUrl]);

  // ─── Debounced search (called by SearchFilters / FilterModal directly) ───────
  const latestFiltersRef = useRef(reduxFilters);
  useEffect(() => {
    latestFiltersRef.current = reduxFilters;
  }, [reduxFilters]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      const payload = { ...latestFiltersRef.current, ...newFilters };
      fetchedKeyRef.current = '';
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

  const syncFiltersToUrl = useCallback(
    (newFilters: any) => {
      const params = new URLSearchParams();

      if (newFilters.query || newFilters.q)
        params.set('q', newFilters.query || newFilters.q);
      if (newFilters.country) params.set('country', newFilters.country);
      if (newFilters.countryCode)
        params.set('countryCode', newFilters.countryCode);
      if (newFilters.state) params.set('state', newFilters.state);
      if (newFilters.city) params.set('city', newFilters.city);
      if (newFilters.datePosted)
        params.set('datePosted', newFilters.datePosted);

      if (newFilters.employmentType?.length > 0) {
        params.set('employmentType', newFilters.employmentType.join(','));
      }
      if (newFilters.experience?.length > 0) {
        params.set('experience', newFilters.experience.join(','));
      }
      if (newFilters.education?.length > 0) {
        params.set('education', newFilters.education.join(','));
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof reduxFilters>) => {
      const combined = { ...reduxFilters, ...newFilters };
      syncFiltersToUrl(combined);
    },
    [reduxFilters, syncFiltersToUrl],
  );

  const hasNextPage = pagination?.hasNextPage !== false;

  const loadMoreJobs = useCallback(() => {
    if (loadingRef.current || !hasNextPage) return;

    // Lock immediately to prevent re-entry before React re-renders
    loadingRef.current = true;

    const currentPage =
      (pagination as any)?.currentPage ?? pagination?.page ?? 1;

    const {
      q,
      country,
      state,
      city,
      datePosted,
      employmentType,
      experience,
      isEmpty,
    } = extractFiltersFromUrl();

    if (isEmpty) {
      const nextPage = currentPage + 1;
      const cacheKey = makeCacheKey('recommend', { page: nextPage });
      if (getCache(cacheKey)) dispatch(setCacheHit(true));
      dispatch(
        getRecommendJobsRequest({
          page: nextPage,
          append: true,
        }),
      );
    } else {
      const payload = {
        query: q,
        country,
        state,
        city,
        datePosted,
        employmentType,
        experience,
        education: [] as string[],
        page: currentPage + 1,
        append: true,
      };
      const cacheKey = makeCacheKey('search', payload);
      if (getCache(cacheKey)) dispatch(setCacheHit(true));
      dispatch(searchJobRequest(payload));
    }
  }, [hasNextPage, pagination, dispatch, extractFiltersFromUrl]);

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
