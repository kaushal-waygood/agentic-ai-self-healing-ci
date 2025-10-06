  import Image from 'next/image';
  import { JobListing } from '@/lib/data/jobs';
  import { MapPin, Briefcase, Clock, Building } from 'lucide-react';
  import { truncate } from '@/utils/formatTitle';
  import { Skeleton } from '@/components/ui/skeleton';

  interface JobCardProps {
    job: JobListing;
    isActive?: boolean;
    onClick: () => void;
  }

  export function JobCard({ job, isActive = false, onClick }: JobCardProps) {
    return (
      <div
        onClick={onClick}
        className={`group relative cursor-pointer transition-all duration-300 ease-out transform  ${
          isActive
            ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-400 shadow-2xl shadow-purple-200/50'
            : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 border border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl hover:shadow-purple-100/30'
        } rounded-2xl py-4 px-6 overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {isActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
        )}

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            {job?.logo ? (
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
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors line-clamp-2">
                {truncate(job.title, 50)}
              </h3>
              <p className="text-purple-600 font-semibold text-sm">
                {job.company} | {job.jobAddress}
              </p>
            </div>
          </div>

          {/* <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span>
                {job.location.city}, {job.location.state}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{job.postedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-cyan-500" />
              <span>{job.employmentType}</span>
              <span className="text-gray-400">•</span>
              <span>{job.experienceLevel}</span>
            </div>
          </div> */}
        </div>
      </div>
    );
  }

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
