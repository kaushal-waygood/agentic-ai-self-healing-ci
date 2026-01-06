'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiInstance from '@/services/api';
import JobDetail from '@/components/jobs/JobDetail';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useDispatch } from 'react-redux';
import { findSingleJobRequest } from '@/redux/reducers/jobReducer';

export default function JobDetailPage() {
  const { jobId } = useParams();

  // const [job, setJob] = useState<any>(null);

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

  if (!job) return <p className="p-4">Loading job details...</p>;

  return <JobDetail job={job} />;
}
