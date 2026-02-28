'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { MatchScoreModal } from './MatchScoreModal';

import { RootState } from '@/redux/rootReducer';
import {
  savedStudentJobsRequest,
  visitedJobsRequest,
} from '@/redux/reducers/jobReducer';

import {
  FilePlus2,
  CheckCircle,
  Heart,
  ExternalLink,
  Sparkles,
  Loader2,
  HeartOff,
  MapPin,
  Briefcase,
  Building2,
  TrendingUp,
  Star,
  Zap,
  Share2,
} from 'lucide-react';

import { JobListing } from '@/lib/data/jobs';
import { postStudentEventsRequest } from '@/redux/reducers/studentReducer';

import { getToken } from '@/hooks/useToken';

interface JobDetailClientProps {
  job: JobListing;
}

interface MatchScore {
  matchScore: number;
  recommendation: string;
}

interface AtsScore {
  atsScore: number;
  suggestions: string;
  improvedResumeSummary: string;
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export default function JobDetail({ job }: JobDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [isLoadingAtsScore, setIsLoadingAtsScore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'match' | 'ats'>('match');
  const [openCard, setOpenCard] = useState<'match' | 'ats' | null>('match');
  const [token, setToken] = useState<string | undefined>(undefined);

  const MATCH_SCORE_KEY = (jobId?: string) =>
    jobId ? `matchScore_${jobId}` : '';

  const ATS_SCORE_KEY = (jobId?: string) => (jobId ? `atsScore_${jobId}` : '');

  useEffect(() => {
    try {
      const accessToken = getToken();
      setToken(accessToken || undefined);
    } catch {
      setToken(undefined);
    }
  }, []);

  useEffect(() => {
    if (!job?._id) return;

    const controller = new AbortController();

    try {
      const rawMatch = localStorage.getItem(MATCH_SCORE_KEY(job._id));
      const parsedMatch = rawMatch ? JSON.parse(rawMatch) : null;

      if (parsedMatch && typeof parsedMatch.matchScore === 'number') {
        setMatchScore(parsedMatch);
      } else {
        setMatchScore(null);
        localStorage.removeItem(MATCH_SCORE_KEY(job._id));
      }
    } catch {
      setMatchScore(null);
      localStorage.removeItem(MATCH_SCORE_KEY(job._id));
    }

    setIsLoadingScore(false);
    setProgress(0);

    // ----- ATS SCORE -----
    try {
      const rawAts = localStorage.getItem(ATS_SCORE_KEY(job._id));
      const parsedAts = rawAts ? JSON.parse(rawAts) : null;

      if (parsedAts && typeof parsedAts.atsScore === 'number') {
        setAtsScore(parsedAts);
      } else {
        setAtsScore(null);
        localStorage.removeItem(ATS_SCORE_KEY(job._id));
      }
    } catch {
      setAtsScore(null);
      localStorage.removeItem(ATS_SCORE_KEY(job._id));
    }

    setIsLoadingScore(false);
    setIsLoadingAtsScore(false);
    setProgress(0);

    return () => controller.abort();
  }, [job?._id]);

  const handleToggleSavedJob = useCallback(async () => {
    try {
      // backend handles toggle; we mirror the toast text to current state
      await dispatch(savedStudentJobsRequest(job._id) as any);
      setIsSaved((prev) => !prev);
      toast({
        title: isSaved ? 'Job Unsaved' : 'Job Saved!',
        description: isSaved
          ? 'You have removed this job from your saved list.'
          : 'You have successfully saved this job.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    }
  }, [dispatch, job._id, isSaved, toast]);

  const handleGetMatchScore = useCallback(async () => {
    if (!job?.description) return;
    setIsLoadingScore(true);
    setMatchScore(null);
    setScoreError(null);
    setProgress(0);

    const controller = new AbortController();
    const { signal } = controller;

    let interval: number | undefined;
    // use window.setInterval typing in TS DOM
    interval = window.setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 1000);

    try {
      const response = await apiInstance.post(
        '/students/calculate-match',
        { jobDescription: job.description },
        { signal },
      );

      if (signal.aborted) return;
      setProgress(100);
      const data = response.data as MatchScore;
      setMatchScore(data);
      if (job._id) {
        localStorage.setItem(`matchScore_${job._id}`, JSON.stringify(data));
      }

      if (!response.success) {
        toast({
          title: 'Success',
          description: 'Successfully calculated the AI match score.',
        });
      }

      if (response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please Upgrade your plan to use AI Match Score.',
        });
      }
    } catch (error) {
      toast({
        title: 'Could not calculate the AI  score.',
        description: error.response.data.message,
      });
      setProgress(0);
      setScoreError('Could not calculate the AI match score.');
    } finally {
      if (interval) window.clearInterval(interval);
      setIsLoadingScore(false);
    }
  }, [job?._id, job?.description]);

  const handleApplyOnSite = useCallback(async () => {
    try {
      dispatch(
        postStudentEventsRequest({ jobId: job._id || job.slug, type: 'VISIT' }),
      );
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to apply for the job',
      });
    }
  }, [dispatch, job._id, toast]);

  const formattedDescription = useMemo(() => {
    const desc = job?.description || '';
    return desc
      .replace(/^(.*?):\s*$/gm, '### $1')
      .replace(/•\s*/g, '- ')
      .replace(/\n\s*\n/g, '\n\n');
  }, [job?.description]);

  if (!job) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a job to see the details</p>
      </div>
    );
  }

  const normalizeText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[•▪◦‣]/g, '-')
      .replace(/\r\n/g, '\n')
      .replace(/\n{2,}/g, '\n\n');
  };

  const KNOWN_HEADINGS = [
    'job description',
    'responsibilities',
    'requirements',
    'qualification',
    'qualifications',
    'skills',
    'skills required',
    'experience',
    'location',
    'about the role',
    'about us',
    'what you will do',
    'what we are looking for',
  ];

  const isHeading = (line: string, nextLine?: string) => {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (!trimmed) return false;

    // 1️⃣ Ends with colon
    if (trimmed.endsWith(':')) return true;

    // 2️⃣ Known headings
    if (KNOWN_HEADINGS.includes(lower)) return true;

    // 3️⃣ Short Title Case (Responsibilities, Requirements)
    if (trimmed.split(' ').length <= 4 && /^[A-Z][A-Za-z\s]+$/.test(trimmed)) {
      return true;
    }

    // 4️⃣ ALL CAPS heading
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
      return true;
    }

    // 5️⃣ Followed by bullet points
    if (nextLine?.trim().startsWith('-')) return true;

    return false;
  };

  const renderJobDescription = (text: string) => {
    const lines = text.split('\n');

    const isHtml = /<[a-z][\s\S]*>/i.test(text);
    if (isHtml) {
      // 2. If it is HTML, render it directly (bypass cleaning)
      return (
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    return lines.map((line, index) => {
      const trimmed = line.trim();
      const nextLine = lines[index + 1];

      if (!trimmed) {
        return <div key={index} className="h-2" />;
      }

      // ✅ Heading
      // if (isHeading(trimmed, nextLine)) {
      //   return (
      //     <div
      //       key={index}
      //       className="mt-5 mb-2 font-semibold text-slate-800 text-sm uppercase tracking-wide"
      //     >
      //       {trimmed.replace(/:$/, '')}
      //     </div>
      //   );
      // }

      // ✅ Bullet point
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        return (
          <div
            key={index}
            className="ml-4 flex items-start gap-2 text-sm text-slate-600"
          >
            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
            <span>{trimmed.replace(/^[-•]/, '').trim()}</span>
          </div>
        );
      }

      // ✅ Normal paragraph
      return (
        <p key={index} className="text-sm text-slate-600 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  const handleGetATSScore = useCallback(async () => {
    if (!job?.description) return;

    setIsLoadingAtsScore(true);
    setAtsScore(null);
    setScoreError(null);
    setProgress(0);

    const controller = new AbortController();
    const { signal } = controller;

    let interval = window.setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 1000);

    try {
      const response = await apiInstance.post(
        '/students/ats-score',
        { jobDescription: job.description },
        { signal },
      );

      if (signal.aborted) return;

      setProgress(100);
      setAtsScore(response.data); // assuming same structure
      if (job._id) {
        localStorage.setItem(
          `atsScore_${job._id}`,
          JSON.stringify(response.data),
        );
      }
      if (!response.success) {
        toast({
          title: 'Success',
          description: 'Successfully calculated the AI match score.',
        });
      }

      if (response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please Upgrade your plan to use AI Match Score.',
        });
      }
    } catch (error) {
      if (!signal.aborted) {
        toast({
          title: 'Could not calculate the AI  score.',
          description: error.response.data.message,
        });
        console.error('ATS score error:', error);
        setProgress(0);
        setScoreError('Failed to calculate ATS Score');
      }
    } finally {
      clearInterval(interval);
      setIsLoadingAtsScore(false);
    }
  }, [job?._id, job?.description]);

  const handleApplyNow = () => {
    router.replace(`/dashboard/jobs/${job._id}/apply`);
  };

  // const cleanHtmlDescription = (content: string) => {
  //   if (!content) return '';

  //   return (
  //     content
  //       // 1. Convert block-ending tags to newlines to preserve layout
  //       .replace(/<\/p>/gi, '\n')
  //       .replace(/<br\s*\/?>/gi, '\n')
  //       .replace(/<\/div>/gi, '\n')
  //       .replace(/<\/li>/gi, '\n')
  //       // 2. Strip start tags and any other remaining tags
  //       .replace(/<[^>]+>/g, '')
  //       // 3. Decode common HTML entities
  //       .replace(/&amp;/g, '&')
  //       .replace(/&nbsp;/g, ' ')
  //       .replace(/&lt;/g, '<')
  //       .replace(/&gt;/g, '>')
  //       // 4. Remove excessive multiple newlines (optional, but looks cleaner)
  //       .replace(/\n\s*\n\s*\n/g, '\n\n')
  //   );
  // };

  // Helper to convert HTML-like strings to the plain text format your renderer expects
  const cleanHtmlDescription = (content: string) => {
    if (!content) return '';
    const isHtml = /<[a-z][\s\S]*>/i.test(content);
    if (isHtml) {
      return content;
    }
    return content

      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n\s*\n\s*\n/g, '\n\n');
  };

  return (
    <div className="min-h-screen space-y-2 transition-all duration-300 animate-in fade-in slide-in-from-left-5 duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-white/20 ">
        <div className="absolute inset-0 bg-header-gradient-primary" />
        <div className="absolute inset-0  opacity-20" />
        <div className="relative p-2 md:p-4 text-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1 space-y-4">
              <h1 className="text-xl md:text-2xl font-semibold mb-3 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-50">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Building2 className="w-4 h-4" />
                  <span className="font-semibold">{job.company}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {(() => {
                      const NOISE = [
                        'anywhere',
                        'remote',
                        'worldwide',
                        'global',
                        'online',
                        'virtual',
                      ];
                      const rawCity = job.location?.city?.trim() ?? '';
                      const city = NOISE.includes(rawCity.toLowerCase())
                        ? ''
                        : rawCity;
                      const state =
                        (job.location as any)?.state?.trim?.() ?? '';
                      const country =
                        (job.country as string | undefined)?.trim() ?? '';
                      const parts: string[] = [];
                      if (city) parts.push(city);
                      if (state && state !== city) parts.push(state);
                      if (country) parts.push(country);
                      if (parts.length > 0) return parts.join(', ');
                      if ((job as any).remote) return '🌐 Remote';
                      return 'Location not specified';
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                  <span className="capitalize">
                    {job?.jobTypes?.[0] || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col  justify-center  flex-wrap items-center gap-4">
              <Button
                onClick={handleToggleSavedJob}
                className={`group relative px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  isSaved
                    ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white shadow-lg shadow-red-500/20 border border-white/30'
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {isSaved ? 'Saved' : 'Save Job'}
                  </span>
                  {isSaved ? (
                    <HeartOff className="w-5 h-5 transition-transform group-hover:scale-110" />
                  ) : (
                    <Heart className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-current" />
                  )}
                </div>
              </Button>

              <Button
                onClick={async () => {
                  const shareData = {
                    title: job.title,
                    text: `Check out this job: ${job.title}`,
                    url: `https://zobsai.com/jobs/${job.slug}`,
                  };

                  try {
                    // Check if the browser supports the native share menu
                    if (navigator.share) {
                      await navigator.share(shareData);
                    } else {
                      // Fallback for desktop/unsupported browsers: Copy to clipboard
                      await navigator.clipboard.writeText(shareData.url);
                      toast({
                        variant: 'success',
                        title: 'Link copied to clipboard',
                        description: 'Share it anywhere!',
                      });
                    }
                  } catch (err) {
                    console.error('Error sharing:', err);
                  }
                }}
                className="group relative px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">Share Job</span>
                  <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-lg border border-white/20 p-1">
        {/* <div className="flex flex-col md:flex-row items-stretch gap-4 px-6"> */}
        <div className="flex  flex-wrap lg:flex-row items-center gap-4 px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center justify-center md:justify-start">
            {job.logo ? (
              <div className="w-12 h-12 relative rounded-lg overflow-hidden shadow-lg ring-4 ring-purple-100/50">
                <Image
                  src={job.logo}
                  alt={job.company || 'Company Logo'}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
            ) : (
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            )}
          </div>

          {token ? (
            // <div className="flex flex-col flex-wrap justify-end md:flex-row gap-2 items-center flex-1 md:gap-4">
            <div className="flex flex-col flex-wrap sm:flex-row sm:justify-end items-stretch gap-2 flex-1">
              {/* Tailor & Apply */}
              {job.applyMethod?.url === 'email' ? (
                <Button
                  asChild
                  className="group relative overflow-hidden px-6 py-4  rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                >
                  <Link
                    href={`/dashboard/apply?slug=${encodeURIComponent(
                      job._id,
                    )}&step=cv`}
                  >
                    <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative flex items-center justify-center gap-2">
                      <FilePlus2 className="w-5 h-5" />
                      <span>Tailor & Apply</span>
                    </div>
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="group relative overflow-hidden px-5 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105  bg-buttonPrimary hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center"
                >
                  <Link
                    href={`/dashboard/apply?slug=${encodeURIComponent(
                      job._id,
                    )}&step=cv`}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <FilePlus2 className="w-5 h-5" />
                      <span>Tailor My Docs</span>
                    </div>
                  </Link>
                </Button>
              )}

              {/* Company Site */}
              {job.origin === 'EXTERNAL' &&
              job.applyMethod.url &&
              job.applyMethod.url !== 'email' ? (
                <Button
                  onClick={handleApplyOnSite}
                  asChild
                  className="group relative overflow-hidden px-5 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-buttonPrimary hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center"
                >
                  <Link
                    href={job.applyMethod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      <span>Apply on Company Site</span>
                    </div>
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={handleApplyNow}
                  className="group relative overflow-hidden px-5 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-buttonPrimary hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center"
                >
                  <Link
                    href={`/dashboard/jobs/${job._id}/apply`}
                    // target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      {/* <Send className="w-5 h-5" /> */}
                      <span>Apply Now</span>
                    </div>
                  </Link>
                </Button>
              )}

              {/* ATS Score */}
              {!atsScore && !isLoadingAtsScore && (
                <Button
                  onClick={handleGetATSScore}
                  className="group relative overflow-hidden px-5 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105  bg-gradient-to-r from-blue-500 to-orange-500  text-white border-0"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>AI ATS Score</span>
                  </div>
                </Button>
              )}

              {isLoadingAtsScore && (
                <div
                  className="relative overflow-hidden px-6 py-2 rounded-lg
      bg-gradient-to-r from-blue-500 to-green-500 text-white
      w-[100px]" // 🔒 lock button width
                >
                  {/* Progress bar */}
                  <div
                    className="absolute inset-y-0 left-0
        bg-gradient-to-r from-purple-400/50 to-blue-400/50
        transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />

                  {/* Content */}
                  <div className="relative flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />

                    {/* Fixed-width number */}
                    <span className="font-semibold tabular-nums w-[3ch] text-center">
                      {progress}%
                    </span>
                  </div>
                </div>
              )}
              {atsScore && !isLoadingAtsScore && (
                <button
                  onClick={handleGetATSScore}
                  className="group relative overflow-hidden px-6  rounded-lg
    bg-gradient-to-r from-blue-500 to-green-500 text-white
      font-bold transition-all duration-300
    
      animate-in fade-in zoom-in"
                >
                  {/* Normal content */}
                  <div className="flex items-center justify-center gap-2 py-1.5 transition-all duration-200 group-hover:opacity-0 group-hover:scale-95">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-lg">{atsScore?.atsScore}/100</span>
                  </div>

                  {/* Hover content */}
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2
      opacity-0 scale-105
      transition-all duration-200
      group-hover:opacity-100 group-hover:scale-100"
                  >
                    {/* <Sparkles className="w-4 h-4" /> */}
                    <span className="text-sm tracking-wide">
                      Recalculate ATS Score
                    </span>
                  </div>
                </button>
              )}

              {isLoadingScore && (
                <div
                  className="relative overflow-hidden px-6 py-2 rounded-lg
      bg-gradient-to-r from-blue-500 to-green-500 text-white
      w-[100px]" // 🔒 lock button width
                >
                  {/* Progress bar */}
                  <div
                    className="absolute inset-y-0 left-0
        bg-gradient-to-r from-purple-400/50 to-blue-400/50
        transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />

                  {/* Content */}
                  <div className="relative flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />

                    {/* Fixed-width number */}
                    <span className="font-semibold tabular-nums w-[3ch] text-center">
                      {progress}%
                    </span>
                  </div>
                </div>
              )}
              {/* Match Score */}
              {!matchScore && !isLoadingScore && (
                <Button
                  onClick={handleGetMatchScore}
                  className="group relative overflow-hidden px-5 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105  bg-gradient-to-r from-blue-500 to-green-500  text-white border-0"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>AI Match Score</span>
                  </div>
                </Button>
              )}

              {matchScore && !isLoadingScore && (
                <button
                  onClick={handleGetMatchScore}
                  className="group relative overflow-hidden px-6 rounded-lg
    bg-gradient-to-r from-blue-500 to-green-500 text-white
      font-bold transition-all duration-300
    
      animate-in fade-in zoom-in"
                >
                  {/* Normal content */}
                  <div className="flex items-center justify-center gap-2 transition-all duration-200 group-hover:opacity-0 group-hover:scale-95 py-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-lg">{matchScore.matchScore}/10</span>
                  </div>

                  {/* Hover content */}
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2
      opacity-0 scale-105
      transition-all duration-200
      group-hover:opacity-100 group-hover:scale-100"
                  >
                    {/* <Sparkles className="w-4 h-4" /> */}
                    <span className="text-sm tracking-wide">
                      Recalculate Match Score
                    </span>
                  </div>
                </button>
              )}

              {/* {scoreError && !isLoadingScore && (
                <Button
                  onClick={handleGetMatchScore}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-500 hover:text-white"
                >
                  Retry Match Score
                </Button>
              )} */}
            </div>
          ) : (
            <div className="flex flex-col justify-end md:flex-row gap-2 items-center flex-1 md:gap-4">
              <Button
                onClick={() => router.push('/login')}
                className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm rounded-lg px-6 py-3 font-semibold text-sm border border-white/20"
              >
                Sign up
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end ">
        <div className="flex items-center bg-gray-100 rounded-lg  border border-gray-200 shadow-sm">
          {atsScore?.atsScore && (
            <button
              onClick={() => {
                setActiveView('ats');
                setOpenCard(null);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg
          text-sm font-semibold transition-all duration-200
          ${
            activeView === 'ats'
              ? 'bg-white text-purple-700 shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
            >
              <Zap className="w-4 h-4" />
              <span>ATS Score :</span>
              <span className="text-xs font-bold">{atsScore.atsScore}</span>
            </button>
          )}

          {matchScore && !isLoadingScore && (
            <button
              onClick={() => {
                setActiveView('match');
                setOpenCard(null);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg
          text-sm font-semibold transition-all duration-200
          ${
            activeView === 'match'
              ? 'bg-white text-purple-700 shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
            >
              <Star className="w-4 h-4" />
              <span>Match Score :</span>
              <span className="text-xs font-bold">{matchScore.matchScore}</span>
            </button>
          )}
        </div>
      </div>

      {activeView === 'match' && matchScore && !isLoadingScore && (
        <div className="rounded-lg border border-purple-200/50 overflow-hidden">
          <button
            onClick={() => setOpenCard(openCard === 'match' ? null : 'match')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-white/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm text-gray-600 flex gap-2">
                <span>Match Score:</span>
                <span className="font-semibold text-purple-700">
                  {matchScore.matchScore}/10
                </span>
              </div>
            </div>

            {/* {openCard === 'match' ? (
              <ChevronUp className="w-5 h-5 text-purple-700" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-700" />
            )} */}
          </button>

          {/* {openCard === 'match' && (
            <div className="px-3 pb-3">
              <div className="bg-white/80 rounded-xl p-3 border">
                <h2 className="font-semibold mb-1">AI Recommendation</h2>
                <p className="text-sm text-gray-700">
                  {matchScore.recommendation}
                </p>
              </div>
            </div>
          )} */}
          <div className="px-3 pb-3">
            <div className="bg-white/80 rounded-xl p-3 border">
              <h2 className="font-semibold mb-1">AI Recommendation</h2>
              <p className="text-sm text-gray-700">
                {matchScore.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeView === 'ats' && atsScore && !isLoadingAtsScore && (
        <div className="rounded-lg border border-purple-200/50 overflow-hidden">
          <button
            onClick={() => setOpenCard(openCard === 'ats' ? null : 'ats')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-white/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm text-gray-600 flex gap-2">
                <span>ATS Score:</span>
                <span className="font-semibold text-purple-700">
                  {atsScore.atsScore}/100
                </span>
              </div>
            </div>

            {/* {openCard === 'ats' ? (
              <ChevronUp className="w-5 h-5 text-purple-700" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-700" />
            )} */}
          </button>
          {/* 
          {openCard === 'ats' && (
            <div className="px-3 pb-3">
              <div className="bg-white/80 rounded-xl p-3 border">
                <h2 className="font-semibold mb-1">ATS Suggestions</h2>
                <p className="text-sm text-gray-700">{atsScore.suggestions}</p>
              </div>
            </div>
          )} */}

          <div className="px-3 pb-3">
            <div className="bg-white/80 rounded-xl p-3 border">
              <h2 className="font-semibold mb-1">ATS Suggestions</h2>
              <p className="text-sm text-gray-700">{atsScore.suggestions}</p>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div
        id="jobDescription"
        className="bg-white/80 rounded-lg  border border-gray-200 p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-purple-600 via-blue-600 to-cyan-600 rounded-full shadow-lg" />
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Job Description
          </h2>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          <details
            open
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          >
            <summary className="hidden" />
            <div className="px-1 pb-4">
              {/* {renderJobDescription(cleanHtmlDescription(job.description))} */}
              {renderJobDescription(job.description)}

              {/* {renderJobDescription(job.description)} */}
            </div>
          </details>
        </div>
      </div>

      {/* Highlights */}
      {job.highlights &&
        Object.entries(job.highlights).map(([title, items], index) => (
          <div
            key={title}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-1.5 h-10 rounded-full shadow-lg ${
                  index % 2 === 0
                    ? 'bg-gradient-to-b from-cyan-600 via-blue-600 to-purple-600'
                    : 'bg-gradient-to-b from-green-600 via-emerald-600 to-teal-600'
                }`}
              />
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title}
              </h3>
            </div>

            <div className="grid gap-4">
              {(items as string[]).map((item, idx) => (
                <div
                  key={`${title}-${idx}`}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-transparent hover:from-purple-50 hover:via-blue-50 hover:to-cyan-50 transition-all duration-300 border border-transparent hover:border-purple-200 hover:shadow-md"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="text-gray-700 flex-1 leading-relaxed text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

      <MatchScoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoadingScore}
        scoreData={matchScore}
        error={scoreError}
      />
    </div>
  );
}
