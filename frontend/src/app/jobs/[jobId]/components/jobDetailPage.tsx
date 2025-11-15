'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiInstance from '@/services/api';
import JobDetail from '@/components/jobs/JobDetail';

export default function JobDetailPage() {
  const { jobId } = useParams();

  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await apiInstance.get(`/jobs/find?slug=${jobId}`);

        setJob(response.data.singleJob);
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (!job) return <p className="p-4">Loading job details...</p>;

  return <JobDetail job={job} />;
}
