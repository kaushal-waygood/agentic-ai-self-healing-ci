import { MouseEvent } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent as ShadcnCardContent, // Renamed import
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Building } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import Link from 'next/link';

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    company: string;
    location: {
      city: string;
      lat: number;
      lng: number;
    };
    type: string;
    postedDate: string;
    companyLogo?: string;
    aiMatchScore?: number;
    earlyApplicant?: boolean;
    activelyHiring?: boolean;
    createdAt?: string;
    slug: string;
  };
  isSelected: boolean;
  onClick?: (slug: string) => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const handleClick = (e: MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(job.slug);
    }
  };

  const CardContentComponent = (
    <Card
      className={`h-full flex flex-col transition-all duration-200 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1 ${
        isSelected ? 'border-primary border-2' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {job.companyLogo ? (
            <Image
              src={job.companyLogo}
              alt={`${job.company} logo`}
              width={48}
              height={48}
              className="rounded-md border object-contain w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-md">
              <Building className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-headline leading-tight">
              {job.title}
            </CardTitle>
            <CardDescription className="text-sm">{job.company}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <ShadcnCardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
        {job.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{job.location.city}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <span>{job.type || 'Not specified'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>{formatDate(job.createdAt)}</span>
        </div>
      </ShadcnCardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
          {job.aiMatchScore && (
            <Badge variant="secondary">Match: {job.aiMatchScore}%</Badge>
          )}
          {job.earlyApplicant && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Early Applicant
            </Badge>
          )}
          {job.activelyHiring && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Actively Hiring
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );

  return onClick ? (
    <button
      className="block group w-full text-left"
      onClick={handleClick}
      aria-label={`View ${job.title} at ${job.company}`}
    >
      {CardContentComponent}
    </button>
  ) : (
    <Link
      href={`/jobs/${job.slug}`}
      className="block group"
      aria-label={`View ${job.title} at ${job.company}`}
    >
      {CardContentComponent}
    </Link>
  );
}
