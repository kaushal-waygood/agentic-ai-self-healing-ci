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

  if (!job)
    return (
      <div className="flex items-center flex-col justify-center min-h-screen">
        <div>
          <Image
            src="/logo.png"
            alt="zobsai logo"
            width={100}
            height={100}
            className="w-10 h-10 animate-bounce"
          />
        </div>
        <p className="font-medium">Loading Job data...</p>
      </div>
    );

  return <JobDetail job={job} />;
}
