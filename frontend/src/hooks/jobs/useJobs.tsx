'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { getAllJobsRequest, startJobStream } from '@/redux/reducers/jobReducer';
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
        page,
        query,
        country,
        city,
        append: false,
      }),
    );
  }, [dispatch, searchParams]);

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
    debounce((newFilters: Partial<typeof reduxFilters>) => {
      const payload = {
        ...reduxFilters,
        ...newFilters,
        page: 1,
        append: false,
      };
      dispatch(startJobStream(payload));
      setFilterModal(false);
    }, 500),
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

  const resetFilters = useCallback(() => {
    const initialFilters = {
      page: 1,
      query: '',
      country: '',
      city: '',
      datePosted: '',
      employmentType: [],
      experience: [],
      append: false,
    };
    dispatch(getAllJobsRequest(initialFilters));
    setFilterModal(false);
  }, [dispatch]);

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
