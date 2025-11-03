'use client';

import Image from 'next/image';
import { JobListing } from '@/lib/data/jobs';
import {
  MapPin,
  Briefcase,
  Clock,
  Building,
  View,
  Eye,
  EyeClosed,
} from 'lucide-react';
import { truncate } from '@/utils/formatTitle';
import { Skeleton } from '@/components/ui/skeleton';
import apiInstance from '@/services/api';
import { useEffect } from 'react';

interface JobCardProps {
  job: JobListing;
  isActive?: boolean;
  onClick: () => void;
}

export function JobCard({ job, isActive = false, onClick }: JobCardProps) {
  const handleClick = async () => {
    try {
      console.log('Viewing job:', job.slug);
      // This call is fine, it only runs on click when job exists.
      await apiInstance.post(`/students/job/viewed/${job.slug}`);
      onClick();
    } catch (error) {
      console.error('Failed to log job view on click:', error);
      // Still call onClick so the UI updates even if the API fails.
      onClick();
    }
  };

  // ✅ FIX: The useEffect hook is now protected and has the correct dependency.
  useEffect(() => {
    // 1. Guard Clause: Prevents the API call if job or job._id is missing.
    if (!job?._id) {
      return;
    }

    const isVisited = async () => {
      try {
        const response = await apiInstance.get(
          `/students/jobs/is-visited/${job._id}`,
        );
        // You can use the response data here to update state if needed
        // For example: setIsViewed(response.data.isVisited);
      } catch (error) {
        // Silently fail or handle error as needed
        console.error('Failed to check if job was visited.', error);
      }
    };

    isVisited();
  }, [job]); // 2. Dependency Array: Ensures the effect runs when the 'job' prop is available.

  return (
    <div
      onClick={handleClick}
      className={`group relative  cursor-pointer transition-all duration-300 ease-out transform  ${
        isActive
          ? ' bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-400 '
          : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 border border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl hover:shadow-purple-100/30'
      } rounded-2xl py-2 px-2 overflow-hidden`}
    >
      <div className=" absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
      )}

      <div className="relative z-10  ">
        <div className="flex items-start gap-4 ">
          {/* {job?.logo ? (
            <Image
              src={job.logo}
              alt={`${job.company} logo`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl border border-gray-200 object-contain bg-white"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
          )} */}

          {job.logo ? (
            <img
              src={job.logo}
              alt={job.company || 'Company Logo'}
              className="w-12 h-12 object-contain rounded"
            />
          ) : (
            <div className="w-12 h-12  rounded-lg flex items-center justify-center ">
              <Image width={32} height={32} src="/logo.png" alt="abc" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h5 className=" text-gray-900  group-hover:text-purple-700 transition-colors line-clamp-2 ">
              {truncate(job.title, 35)}
            </h5>

            <div className="text-xs  ">
              <div className="flex items-center gap-2 text-purple-500 font-semibold ">
                <span>{truncate(job.company, 35)}</span>
              </div>

              <div className="flex items-center gap-2 ">
                <span>{job.location.city}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>{'4 hour ago'}</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span>{job.views} </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// JobCardSkeleton remains the same
export function JobCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
    </div>
  );
}
