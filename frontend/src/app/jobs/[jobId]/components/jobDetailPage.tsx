'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiInstance from '@/services/api';
import JobDetail from '@/components/jobs/JobDetail';
import Image from 'next/image';

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
