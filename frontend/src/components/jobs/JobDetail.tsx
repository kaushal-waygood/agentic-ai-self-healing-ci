'use client';

import React, { useState, useEffect } from 'react';
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
import ReactMarkdown from 'react-markdown';
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
  Heart,
  ExternalLink,
  Sparkles,
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
  const [calculateScore, setCalculateScore] = useState({
    matchScore: 0,
    recommendation: '',
  });

  // In your handleSavedJob function
  const handleSavedJob = async () => {
    try {
      const response = await apiInstance.post('students/jobs/saved', {
        jobId: job._id,
      });

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

  // ✅ FIXED useEffect HOOK
  useEffect(() => {
    if (!job?._id) return; // Add a guard clause in case job is not ready

    const handleIsJobApplied = async () => {
      try {
        const response = await apiInstance.get('/students/job/isapplied', {
          // The `params` value must be an object
          params: { jobId: job._id },
        });
        setIsApplying(response.data.isApplied);
      } catch (error) {
        console.error('Failed to check if job is applied:', error);
      }
    };
    handleIsJobApplied();
  }, [job]); // Depend on `job` to re-run when it changes

  useEffect(() => {
    if (!job?._id) return; // Add a guard clause
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

    setMatchScoreResult(null);
  }, [job]);

  const handleGetMatchScore = async () => {
    const response = await apiInstance.post('/students/calculate-match', {
      jobDescription: job.description,
    });

    setCalculateScore(response.data);
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
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center gap-4 text-purple-100">
              <span className="font-semibold">{job.company}</span>
              <span>|</span>
              <span>{job.jobAddress}</span>
              <span>|</span>
              <span className="capitalize">{job.jobTypes[0]}</span>
            </div>
          </div>

          <Button
            onClick={handleSavedJob}
            disabled={isSaved}
            className={`flex items-center gap-2 w-10 h-10 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isSaved
                ? 'bg-white hover:bg-white text-white shadow-red-200 relative z-[999]'
                : 'bg-red-100 hover:bg-red-200 text-red-700 shadow-red-200'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? 'fill-current text-red-500' : ''
              }`}
            />
            {/* {isSaved ? 'Saved' : 'Save Job'} */}
          </Button>
        </div>
        <div className="p-6 flex justify-between items-center">
          <div></div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
            >
              <Link href={`/apply?slug=${encodeURIComponent(job.slug)}`}>
                <FilePlus2 className="w-4 h-4" /> Tailor & Apply
              </Link>
            </Button>
            {job.applyMethod.url && (
              <Button
                onClick={handleApplyOnSite}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-200"
              >
                <ExternalLink className="w-4 h-4" /> Company Site
              </Button>
            )}

            <button
              onClick={handleGetMatchScore}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
            >
              Calculate My Match Score
            </button>
            <p className="text-gray-600 mt-2">
              {/* Calculate your match score based on your profile and job */}
              {/* requirements. */}
            </p>
            {calculateScore.matchScore > 0 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-lg font-semibold text-gray-800">
                  Your AI Match Score is:
                  <span className="ml-2 text-2xl font-bold text-purple-600">
                    {calculateScore.matchScore}/10
                  </span>
                </p>
                <p className="text-gray-600 mt-2">
                  {calculateScore.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          Job Description
        </h2>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: job.description }}></div>
        </div>
      </div>

      {/* Highlights */}
      {job.highlights &&
        Object.entries(job.highlights).map(
          ([title, items]: [string, string[]]) => (
            <div
              key={title}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                {title}
              </h3>
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ),
        )}

      {/* AI Match Score */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Match Score
          </h3>
        </div>
        {isLoadingScore ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-600">Analyzing your profile...</p>
          </div>
        ) : matchScoreResult ? (
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full opacity-20"></div>
              <div className="relative text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {matchScoreResult.matchScore}
              </div>
            </div>
            {/* You can add back the reasoning, strengths, etc. here */}
            <p className="text-gray-600 mt-2">{matchScoreResult.reasoning}</p>
          </div>
        ) : (
          <div>
            <button
              onClick={handleGetMatchScore}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
            >
              Calculate My Match Score
            </button>

            {calculateScore.matchScore > 0 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-lg font-semibold text-gray-800">
                  Your AI Match Score is:
                  <span className="ml-2 text-2xl font-bold text-purple-600">
                    {calculateScore.matchScore}/10
                  </span>
                </p>
                <p className="text-gray-600 mt-2">
                  {calculateScore.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
