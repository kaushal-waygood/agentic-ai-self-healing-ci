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
  ChevronDown,
  ChevronUp,
  HeartOff,
  MapPin,
  Briefcase,
  Building2,
  TrendingUp,
  Star,
} from 'lucide-react';

import { JobListing } from '@/lib/data/jobs';
import { postStudentEventsRequest } from '@/redux/reducers/studentReducer';

interface JobDetailClientProps {
  job: JobListing;
}

interface MatchScore {
  matchScore: number;
  recommendation: string;
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

  const { savedJobs } = useSelector((state: RootState) => state.jobs);

  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);

  // token lookup (SSR-safe)
  useEffect(() => {
    try {
      const accessToken =
        (typeof window !== 'undefined' &&
          window.localStorage?.getItem('accessToken')) ||
        getCookie('accessToken');
      setToken(accessToken || undefined);
    } catch {
      setToken(undefined);
    }
  }, []);

  // load cached score and job saved/applied flags
  useEffect(() => {
    if (!job?._id) return;

    const controller = new AbortController();
    const { signal } = controller;

    const savedScore = localStorage.getItem(`matchScore_${job._id}`);
    setMatchScore(savedScore ? (JSON.parse(savedScore) as MatchScore) : null);
    setIsLoadingScore(false);
    setProgress(0);

    const checkJobStatus = async () => {
      try {
        const [savedRes, appliedRes] = await Promise.all([
          apiInstance.get('students/jobs/issaved', {
            params: { jobId: job._id },
            signal,
          }),
          apiInstance.get('/students/job/isapplied', {
            params: { jobId: job._id },
            signal,
          }),
        ]);
        if (signal.aborted) return;
        setIsSaved(Boolean(savedRes?.data?.isSaved));
        setIsApplying(Boolean(appliedRes?.data?.isApplied));
      } catch (error) {
        if (!signal.aborted) {
          // quiet log; don’t spam the UI
          console.error('Failed to check job status:', error);
        }
      }
    };

    checkJobStatus();
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
    } catch (error) {
      if (!signal.aborted) {
        console.error('Match score error:', error);
        setProgress(0);
        setScoreError('Could not calculate the AI match score.');
      }
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

    return lines.map((line, index) => {
      const trimmed = line.trim();
      const nextLine = lines[index + 1];

      if (!trimmed) {
        return <div key={index} className="h-2" />;
      }

      // ✅ Heading
      if (isHeading(trimmed, nextLine)) {
        return (
          <div
            key={index}
            className="mt-5 mb-2 font-semibold text-slate-800 text-sm uppercase tracking-wide"
          >
            {trimmed.replace(/:$/, '')}
          </div>
        );
      }

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
  // const renderJobDescription = (raw: string) => {
  //   const lines = normalizeText(raw).split('\n');

  //   return lines.map((line, i) => {
  //     const trimmed = line.trim();

  //     if (!trimmed) {
  //       return <div key={i} className="h-2" />;
  //     }

  //     // 🔹 BULLET
  //     if (trimmed.startsWith('-')) {
  //       return (
  //         <div
  //           key={i}
  //           className="ml-4 flex items-start gap-3 text-sm text-slate-600"
  //         >
  //           <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
  //           <span className="leading-relaxed">
  //             {trimmed.replace(/^-\s*/, '')}
  //           </span>
  //         </div>
  //       );
  //     }

  //     // 🔹 KEY : VALUE
  //     if (/^[A-Za-z][A-Za-z\s]{2,25}:\s+/.test(trimmed)) {
  //       const [key, ...rest] = trimmed.split(':');
  //       return (
  //         <div key={i} className="text-sm text-slate-700">
  //           <span className="font-semibold">{key}:</span>{' '}
  //           <span className="text-slate-600">{rest.join(':').trim()}</span>
  //         </div>
  //       );
  //     }

  //     // 🔹 ALL CAPS / EMPHASIZED LINE → TITLE
  //     if (
  //       trimmed === trimmed.toUpperCase() &&
  //       trimmed.length > 4 &&
  //       trimmed.length < 60
  //     ) {
  //       return (
  //         <div
  //           key={i}
  //           className="mt-5 mb-2 text-sm font-bold tracking-wide text-slate-800"
  //         >
  //           {trimmed}
  //         </div>
  //       );
  //     }

  //     // 🔹 NORMAL TEXT
  //     return (
  //       <p key={i} className="text-sm text-slate-600 leading-relaxed">
  //         {trimmed}
  //       </p>
  //     );
  //   });
  // };

  return (
    <div className="min-h-screen space-y-2">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-white/20">
        <div className="absolute inset-0 bg-header-gradient-primary opacity-90" />
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
                  <span>{job.country || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                  <span className="capitalize">
                    {job?.jobTypes?.[0] || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

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
              <div className="w-12 h-12 relative rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 shadow-lg ring-4 ring-purple-100/50">
                <Image
                  src="/logo.png"
                  alt={job.company || 'Company Logo'}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
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
              {job.applyMethod?.url && job.applyMethod.url !== 'email' && (
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
                      <span>Company Site</span>
                    </div>
                  </Link>
                </Button>
              )}

              {/* Match Score */}
              {!matchScore && !isLoadingScore && (
                <Button
                  onClick={handleGetMatchScore}
                  className="group relative overflow-hidden px-5 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105  bg-gradient-to-r from-amber-500 to-orange-500  text-white border-0"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>AI Match Score</span>
                  </div>
                </Button>
              )}

              {isLoadingScore && (
                <div className="relative overflow-hidden px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400/50 to-blue-400/50 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="relative flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-semibold">{progress}%</span>
                  </div>
                </div>
              )}

              {matchScore && !isLoadingScore && (
                <div className="relative overflow-hidden px-6 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white  animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold text-lg">
                      {matchScore.matchScore}/10
                    </span>
                  </div>
                </div>
              )}
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

      {/* AI Recommendation */}
      {matchScore && !isLoadingScore && (
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-lg border border-purple-200/50 overflow-hidden animate-in slide-in-from-top duration-500">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="w-full px-3 py-3 flex items-center justify-between gap-3 hover:bg-white/50 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-purple-500/30">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg text-gray-900">
                  AI Recommendation
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span>Match Score:</span>
                  <span className="font-semibold text-purple-700">
                    {matchScore.matchScore}/10
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2 hover:bg-white rounded-lg transition-colors">
              {isOpen ? (
                <ChevronUp className="w-6 h-6 text-purple-700" />
              ) : (
                <ChevronDown className="w-6 h-6 text-purple-700" />
              )}
            </div>
          </button>

          {isOpen && (
            <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-purple-100 shadow-inner">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {matchScore.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-purple-600 via-blue-600 to-cyan-600 rounded-full shadow-lg" />
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Job Description
          </h2>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {/* <ReactMarkdown
            // minimal custom renderers to keep perf decent
            components={{
              h3: (props: any) => (
                <h3
                  className="text-sm font-bold text-gray-900 mt-6 mb-2 flex items-center gap-2"
                  {...props}
                />
              ),
              ul: (props: any) => <ul className="space-y-2 ml-2" {...props} />,
              li: (props: any) => (
                <li
                  className="flex items-start gap-3 leading-relaxed"
                  {...props}
                />
              ),
              p: (props: any) => (
                <p className="text-gray-700 text-sm" {...props} />
              ),
            }}
          >
            {formattedDescription}
          </ReactMarkdown> */}
          {/* new  */}
          {/* <details
            open
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          >
            <div className="px-1 pb-4">
              <div className=" overflow-y-auto text-sm text-slate-600 whitespace-pre-line pr-2 border-l-2 border-blue-500 pl-3">
                {job.description}
              </div>
            </div>
          </details> */}

          <details
            open
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          >
            <summary className="hidden" />
            <div className="px-1 pb-4">
              {renderJobDescription(job.description)}
              {/* <div className=" overflow-y-auto pr-3  pl-3 space-y-1">
              </div> */}
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
