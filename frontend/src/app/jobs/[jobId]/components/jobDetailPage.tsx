'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiInstance from '@/services/api';
import JobDetail from '@/components/jobs/JobDetail';
import Image from 'next/image';
import { findSingleJobRequest } from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Loader } from '@/components/Loader';

export default function JobDetailPage() {
  const { jobId } = useParams();

  const { job, error, loading } = useSelector((state: RootState) => state.jobs);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        dispatch(findSingleJobRequest(jobId));
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (!job) return <Loader />;

  return <JobDetail job={job} />;
}
