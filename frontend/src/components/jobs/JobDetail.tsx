'use client';

import { useState, useEffect } from 'react';
import { JobListing } from '@/lib/data/jobs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Briefcase,
  Clock,
  Building,
  DollarSign,
  Star,
  FilePlus2,
  ShieldCheck,
  CheckCircle,
  Mail,
  ExternalLink,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateJobMatchingScore,
  CalculateJobMatchingScoreOutput,
} from '@/ai/flows/ai-job-matching-score';
import {
  mockUserProfile,
  mockOrganizations,
  planTierOrder,
} from '@/lib/data/user';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ToastAction } from '../ui/toast';
import { Separator } from '../ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { FormattedText } from '@/utils/FormatText';
import apiInstance from '@/services/api';

interface JobDetailClientProps {
  job: JobListing;
}

export default function JobDetail({ job }: JobDetailClientProps) {
  const [matchScoreResult, setMatchScoreResult] =
    useState<CalculateJobMatchingScoreOutput | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const { toast } = useToast();
  const [canUseProFeatures, setCanUseProFeatures] = useState(false);
  const [isSaved, setIsSaved] = useState();
  const [isApplying, setIsApplying] = useState(false);

  // In your handleSavedJob function
  const handleSavedJob = async () => {
    try {
      const response = await apiInstance.post('students/jobs/saved', {
        jobId: job._id,
      });

      // ✅ ADD THIS LINE: Update the state after a successful save
      setIsSaved(true);

      toast({
        title: 'Job Saved!',
        description: 'You have successfully saved this job.',
      });
    } catch (error) {
      console.error('Failed to save job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save the job.',
      });
    }
  };

  const fetchSavedJob = async () => {
    const resposne = await apiInstance.get('students/jobs/issaved', {
      params: {
        jobId: job._id,
      },
    });
    setIsSaved(resposne.data.isSaved);
  };

  useEffect(() => {
    const handleIsJobApplied = async () => {
      try {
        console.log('job._id', job._id);
        const response = await apiInstance.get('/students/job/isapplied', {
          params: job._id,
        });
        setIsApplying(response.data.isApplied);
        console.log('isApplied', response.data.isApplied);
      } catch (error) {
        console.error('Failed to check if job is applied:', error);
      }
    };
    handleIsJobApplied();
  }, []);

  useEffect(() => {
    fetchSavedJob();
  }, [job]);

  useEffect(() => {
    // Determine the user's effective plan
    const user = mockUserProfile;
    const org = user.organizationId
      ? mockOrganizations.find((o) => o.id === user.organizationId)
      : null;
    let basePlanId = user.currentPlanId;
    if (user.role === 'OrgMember' && org) {
      basePlanId = org.planId;
    }
    const effectivePlanId =
      user.personalPlanId &&
      planTierOrder[user.personalPlanId] > planTierOrder[basePlanId]
        ? user.personalPlanId
        : basePlanId;

    // AI Match Score is a "Pro" level feature
    setCanUseProFeatures(
      planTierOrder[effectivePlanId] >= planTierOrder['pro'],
    );

    // Reset score when the job changes
    setMatchScoreResult(null);
  }, [job]);

  const handleGetMatchScore = async () => {
    if (!canUseProFeatures) {
      toast({
        variant: 'destructive',
        title: 'Upgrade to Pro',
        description:
          'AI Match Score is a Pro feature. Please upgrade your plan to use it.',
        action: (
          <ToastAction altText="Upgrade" asChild>
            <Link href="/subscriptions">Upgrade</Link>
          </ToastAction>
        ),
      });
      return;
    }

    setIsLoadingScore(true);
    setMatchScoreResult(null);
    try {
      const userProfileSummary = `
        Job Preference: ${mockUserProfile.jobPreference}
        Skills: ${mockUserProfile.skills.join(', ')}
        Experience: ${mockUserProfile.experience
          .map((e) => `${e.jobTitle} at ${e.company} for ${e.endDate}`)
          .join('; ')}
        Narratives: ${mockUserProfile.narratives.achievements}. ${
        mockUserProfile.narratives.challenges
      }.
      `;
      const result = await calculateJobMatchingScore({
        jobDescription: job.description,
        userProfile: userProfileSummary,
      });
      setMatchScoreResult(result);
    } catch (error) {
      console.error('Failed to get match score:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not calculate the AI match score.',
      });
    } finally {
      setIsLoadingScore(false);
    }
  };

  const handleApplyOnSite = async () => {
    try {
      const response = await apiInstance.post(`/students/job/apply/${job._id}`);
      if (response.status === 200) {
        window.open(job.applyMethod.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to apply for the job',
      });
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a job to see the details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{job.title}</CardTitle>
          <CardDescription className="space-x-2">
            <span>{job.company}</span>
            <span>&middot;</span>
            <span>
              {job.location?.city}
              {job.location?.state ? `, ${job.location.state}` : ''}
            </span>
            <span>&middot;</span>
            <span className="text-gray-500">{job.postedDate}</span>
          </CardDescription>
          <div className="flex gap-2 pt-2">
            <Button asChild>
              <Link href={`/apply?slug=${encodeURIComponent(job.slug)}`}>
                <FilePlus2 className="mr-2 h-4 w-4" /> Tailor & Apply
              </Link>
            </Button>
            {job.applyMethod.url && (
              <Button variant="outline" onClick={handleApplyOnSite}>
                <ExternalLink className="mr-2 h-4 w-4" /> Apply on Company Site
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSavedJob}
              disabled={isSaved}
            >
              <Save
                className="mr-2 h-4 w-4"
                // Fill the icon if the job is saved
                fill={isSaved ? 'currentColor' : 'none'}
              />
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FormattedText text={job.description} />
        </CardContent>
      </Card>

      {job.highlights &&
        Object.entries(job.highlights).map(([title, items]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-3 mt-1 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" /> AI Match Score
          </CardTitle>
          <CardDescription>
            {canUseProFeatures
              ? 'See how your profile aligns with this job.'
              : 'This is a Pro feature. Upgrade to unlock.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingScore && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {matchScoreResult ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {matchScoreResult.matchScore}
                </p>
                <p className="text-sm text-muted-foreground">Match Score</p>
              </div>
              <div>
                <h4 className="font-semibold">Reasoning:</h4>
                <p className="text-sm text-muted-foreground">
                  {matchScoreResult.reasoning}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Strengths:</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {matchScoreResult.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Areas for Improvement:</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {matchScoreResult.areasForImprovement.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleGetMatchScore}
              className="w-full"
              disabled={isLoadingScore || !canUseProFeatures}
            >
              {canUseProFeatures ? (
                'Calculate My Score'
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Upgrade to Pro
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
