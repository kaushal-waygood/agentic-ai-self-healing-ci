import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { JobListing } from '@/lib/data/jobs';
import { MapPin, Briefcase, Clock, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { truncate } from '@/utils/formatTitle';

interface JobCardProps {
  job: JobListing;
  isActive?: boolean;
}

export function JobCard({ job, isActive = false }: JobCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md hover:border-primary/50',
        isActive && 'border-primary bg-primary/10 shadow-md',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {job.companyLogo ? (
            <Image
              src={job.companyLogo}
              alt={`${job.company} logo`}
              width={40}
              height={40}
              className="rounded-md border object-contain w-10 h-10"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
              <Building className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle className="text-base font-semibold leading-tight">
              {truncate(job.title, 30)}
            </CardTitle>
            <CardDescription className="text-sm">{job.company}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          <span>
            {job.location.city}, {job.location.postalCode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{job.postedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
