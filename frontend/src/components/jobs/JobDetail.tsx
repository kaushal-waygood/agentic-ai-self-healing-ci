'use client';

import React, { useState, useEffect } from 'react';
import { JobListing } from '@/lib/data/jobs';
import { Button } from '@/components/ui/button';
import {
  FilePlus2,
  CheckCircle,
  Heart,
  ExternalLink,
  Sparkles,
  Loader2, // ✅ LOGIC: Imported Loader for loading state
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { MatchScoreModal } from './MatchScoreModal';

interface JobDetailClientProps {
  job: JobListing;
}

interface MatchScore {
  matchScore: number;
  recommendation: string;
}

export default function JobDetail({ job }: JobDetailClientProps) {
  // ✅ LOGIC: Unified state for the match score. This is now the single source of truth.
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const { toast } = useToast();
  // ✅ FIX: Initialized state to a boolean for predictable behavior
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  // ✅ LOGIC: Combined useEffects for cleaner state management when the job changes
  useEffect(() => {
    if (!job?._id) return;

    // Reset state when a new job is selected
    setMatchScore(null);
    setIsLoadingScore(false);

    const checkJobStatus = async () => {
      try {
        const [savedRes, appliedRes] = await Promise.all([
          apiInstance.get('students/jobs/issaved', {
            params: { jobId: job._id },
          }),
          apiInstance.get('/students/job/isapplied', {
            params: { jobId: job._id },
          }),
        ]);
        setIsSaved(savedRes.data.isSaved);
        setIsApplying(appliedRes.data.isApplied);
      } catch (error) {
        console.error('Failed to check job status:', error);
      }
    };

    checkJobStatus();
  }, [job]);

  const handleSavedJob = async () => {
    try {
      await apiInstance.post('students/jobs/saved', { jobId: job._id });
      setIsSaved(true);
      toast({
        title: 'Job Saved!',
        description: 'You have successfully saved this job.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save the job.',
      });
    }
  };

  const handleGetMatchScore = async () => {
    setIsModalOpen(true); // Open the modal immediately
    setIsLoadingScore(true);
    setMatchScore(null);
    setScoreError(null); // Reset error state

    try {
      const response = await apiInstance.post('/students/calculate-match', {
        jobDescription: job.description,
      });
      setMatchScore(response.data);
    } catch (error) {
      console.error('Match score error:', error);
      setScoreError('Could not calculate the AI match score.');
    } finally {
      setIsLoadingScore(false);
    }
  };

  const handleApplyOnSite = async () => {
    try {
      await apiInstance.post(`/students/job/apply/${job._id}`);
      window.open(job.applyMethod.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
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

  // --- UI BELOW IS UNCHANGED, ONLY LOGIC FOR RENDERING IS FIXED ---
  return (
    <div className="space-y-6">
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
          </Button>
        </div>
        <div className="p-6 flex justify-between items-center">
          <div>{/* <Image ... /> */}</div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Button
                asChild
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
              >
                <Link
                  href={`/dashboard/apply?slug=${encodeURIComponent(
                    job._id,
                  )}&step=cv`}
                >
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
              {/* ✅ FIX: The Calculate button is now part of the conditional logic */}
              {!matchScore && !isLoadingScore && (
                <Button
                  onClick={handleGetMatchScore}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
                >
                  Calculate My Match Score
                </Button>
              )}
            </div>

            {/* ✅ FIX: This block now correctly shows loading state or results */}
            {isLoadingScore && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            )}

            {matchScore && !isLoadingScore && (
              <div className="flex flex-col gap-2 p-2 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2 font-semibold text-purple-800">
                  <Sparkles className="w-4 h-4" />
                  {/* FIX: Displays the score from the state object property */}
                  <p>Match Score: {matchScore.matchScore}/10</p>
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  {matchScore.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          Job Description
        </h2>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: job.description }}></div>
        </div>
      </div>

      <MatchScoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoadingScore}
        scoreData={matchScore}
        error={scoreError}
      />
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
      {/* <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6">
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
         You can add back the reasoning, strengths, etc. here 
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
      </div> */}
    </div>
  );
}
