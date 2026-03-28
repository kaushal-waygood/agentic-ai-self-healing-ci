// 'use client';

// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { useDispatch } from 'react-redux';

// import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';
// import apiInstance from '@/services/api';
// import { MatchScoreModal } from './MatchScoreModal';

// import {
//   savedStudentJobsRequest,
//   visitedJobsRequest,
// } from '@/redux/reducers/jobReducer';
// import { useProfile } from '@/hooks/useProfile';

// import {
//   FilePlus2,
//   CheckCircle,
//   Heart,
//   ExternalLink,
//   Sparkles,
//   Loader2,
//   HeartOff,
//   MapPin,
//   Briefcase,
//   Building2,
//   TrendingUp,
//   Star,
//   Zap,
//   Share2,
//   ChevronDown,
//   ChevronUp,
//   Briefcase as BriefcaseIcon,
//   BarChart3,
//   Lightbulb,
//   Target,
//   FileText,
//   FileSignature,
// } from 'lucide-react';

// import { JobListing } from '@/lib/data/jobs';
// import { postStudentEventsRequest } from '@/redux/reducers/studentReducer';

// import { getToken } from '@/hooks/useToken';
// import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// interface JobDetailClientProps {
//   job: JobListing;
// }

// interface MatchScore {
//   matchScore: number;
//   skillsFitPercent?: number;
//   experienceFitPercent?: number;
//   seniorityFitPercent?: number;
//   techFitPercent?: number;
//   roleFitPercent?: number;
//   breakdown?: { skills: string; experience: string; seniority: string };
//   skillsMatched?: { skill: string }[];
//   skillsMissing?: string[];
//   suggestions?: string[];
//   recommendation: string;
//   improvedSummary?: string;
// }

// interface AtsScore {
//   atsScore: number;
//   suggestions: string;
//   improvedResumeSummary: string;
// }

// function getCookie(name: string): string | undefined {
//   if (typeof document === 'undefined') return undefined;
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop()?.split(';').shift();
//   return undefined;
// }

// export default function JobDetail({ job }: JobDetailClientProps) {
//   const { toast } = useToast();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { profile } = useProfile();

//   const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
//   const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
//   const [isLoadingScore, setIsLoadingScore] = useState(false);
//   const [isLoadingAtsScore, setIsLoadingAtsScore] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [scoreError, setScoreError] = useState<string | null>(null);
//   const [activeView, setActiveView] = useState<'match' | 'ats'>('match');
//   const [isApplying, setIsApplying] = useState(false);
//   const [openCard, setOpenCard] = useState<'match' | 'ats' | null>('match');
//   const [token, setToken] = useState<string | undefined>(undefined);
//   const [savedCvs, setSavedCvs] = useState<
//     { _id: string; htmlCVTitle?: string }[]
//   >([]);
//   const [cvForMatch, setCvForMatch] = useState<string>('profile');

//   const MATCH_SCORE_KEY = (jobId?: string) =>
//     jobId ? `matchScore_${jobId}` : '';

//   const ATS_SCORE_KEY = (jobId?: string) => (jobId ? `atsScore_${jobId}` : '');

//   useEffect(() => {
//     try {
//       const accessToken = getToken();
//       setToken(accessToken || undefined);
//     } catch {
//       setToken(undefined);
//     }
//   }, []);

//   useEffect(() => {
//     if (!token) return;
//     const fetchCvs = async () => {
//       try {
//         const res = await apiInstance.get('/students/resume/saved');
//         const list = res.data?.html || res.data || [];
//         setSavedCvs(Array.isArray(list) ? list : []);
//       } catch {
//         setSavedCvs([]);
//       }
//     };
//     fetchCvs();
//   }, [token]);

//   useEffect(() => {
//     if (!job?._id) return;

//     const controller = new AbortController();
//     const matchCacheKey =
//       cvForMatch && cvForMatch !== 'profile'
//         ? `matchScore_${job._id}_${cvForMatch}`
//         : MATCH_SCORE_KEY(job._id);

//     try {
//       const rawMatch = localStorage.getItem(matchCacheKey);
//       const parsedMatch = rawMatch ? JSON.parse(rawMatch) : null;

//       if (parsedMatch && typeof parsedMatch.matchScore === 'number') {
//         setMatchScore(parsedMatch);
//       } else {
//         setMatchScore(null);
//         localStorage.removeItem(matchCacheKey);
//       }
//     } catch {
//       setMatchScore(null);
//       localStorage.removeItem(matchCacheKey);
//     }

//     setIsLoadingScore(false);
//     setProgress(0);

//     // ----- ATS SCORE -----
//     try {
//       const rawAts = localStorage.getItem(ATS_SCORE_KEY(job._id));
//       const parsedAts = rawAts ? JSON.parse(rawAts) : null;

//       if (parsedAts && typeof parsedAts.atsScore === 'number') {
//         setAtsScore(parsedAts);
//       } else {
//         setAtsScore(null);
//         localStorage.removeItem(ATS_SCORE_KEY(job._id));
//       }
//     } catch {
//       setAtsScore(null);
//       localStorage.removeItem(ATS_SCORE_KEY(job._id));
//     }

//     setIsLoadingScore(false);
//     setIsLoadingAtsScore(false);
//     setProgress(0);

//     return () => controller.abort();
//   }, [job?._id, cvForMatch]);

//   // token lookup (SSR-safe)
//   // useEffect(() => {
//   //   try {
//   //     const accessToken =
//   //       (typeof window !== 'undefined' &&
//   //         window.localStorage?.getItem('accessToken')) ||
//   //       getCookie('accessToken');
//   //     setToken(accessToken || undefined);
//   //   } catch {
//   //     setToken(undefined);
//   //   }
//   // }, []);

//   // load cached score and job saved/applied flags
//   useEffect(() => {
//     if (!job?._id) return;

//     const controller = new AbortController();
//     const { signal } = controller;

//     const cacheKey =
//       cvForMatch && cvForMatch !== 'profile'
//         ? `matchScore_${job._id}_${cvForMatch}`
//         : `matchScore_${job._id}`;
//     const savedScore = localStorage.getItem(cacheKey);
//     setMatchScore(savedScore ? (JSON.parse(savedScore) as MatchScore) : null);
//     setIsLoadingScore(false);
//     setProgress(0);

//     const checkJobStatus = async () => {
//       try {
//         const savedRes = await apiInstance.get(
//           '/students/jobs/intraction-status',
//           { params: { jobId: job._id }, signal },
//         );

//         if (signal.aborted) return;
//         setIsSaved(Boolean(savedRes?.data?.saved));
//         setIsApplying(Boolean(savedRes?.data?.applied));
//       } catch (error) {
//         if (!signal.aborted) {
//           // quiet log; don’t spam the UI
//           console.error('Failed to check job status:', error);
//         }
//       }
//     };

//     checkJobStatus();
//     return () => controller.abort();
//   }, [job?._id, cvForMatch]);

//   const handleToggleSavedJob = useCallback(async () => {
//     try {
//       // backend handles toggle; we mirror the toast text to current state
//       await dispatch(savedStudentJobsRequest(job._id) as any);
//       setIsSaved((prev) => !prev);
//       toast({
//         title: isSaved ? 'Job Unsaved' : 'Job Saved!',
//         description: isSaved
//           ? 'You have removed this job from your saved list.'
//           : 'You have successfully saved this job.',
//       });
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Something went wrong. Please try again.',
//       });
//     }
//   }, [dispatch, job._id, isSaved, toast]);

//   const handleGetMatchScore = useCallback(async () => {
//     if (!job?.description) return;
//     setIsLoadingScore(true);
//     setMatchScore(null);
//     setScoreError(null);
//     setProgress(0);

//     const controller = new AbortController();
//     const { signal } = controller;

//     let interval: number | undefined;
//     // use window.setInterval typing in TS DOM
//     interval = window.setInterval(() => {
//       setProgress((prev) => (prev < 90 ? prev + 5 : prev));
//     }, 1000);

//     const payload: Record<string, string> = {
//       jobDescription: job.description,
//       jobTitle: job.title || '',
//     };
//     if (cvForMatch && cvForMatch !== 'profile') {
//       payload.savedCVId = cvForMatch;
//     }

//     try {
//       const response = await apiInstance.post(
//         '/students/calculate-match',
//         payload,
//         { signal },
//       );

//       if (signal.aborted) return;
//       setProgress(100);
//       const data = response.data as MatchScore;
//       setMatchScore(data);
//       if (job._id) {
//         const cacheKey =
//           cvForMatch && cvForMatch !== 'profile'
//             ? `matchScore_${job._id}_${cvForMatch}`
//             : `matchScore_${job._id}`;
//         localStorage.setItem(cacheKey, JSON.stringify(data));
//       }

//       if (!response.success) {
//         toast({
//           title: 'Success',
//           description: 'Successfully calculated the AI match score.',
//         });
//       }

//       if (response.status === 429) {
//         toast({
//           title: 'Rate limit exceeded',
//           description: 'Please Upgrade your plan to use AI Match Score.',
//         });
//       }
//     } catch (error) {
//       toast({
//         title: 'Could not calculate the AI  score.',
//         description: error.response.data.message,
//       });
//       setProgress(0);
//       setScoreError('Could not calculate the AI match score.');
//     } finally {
//       if (interval) window.clearInterval(interval);
//       setIsLoadingScore(false);
//     }
//   }, [job?._id, job?.description, cvForMatch]);

//   const handleApplyOnSite = useCallback(async () => {
//     try {
//       dispatch(
//         postStudentEventsRequest({ jobId: job._id || job.slug, type: 'VISIT' }),
//       );
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to apply for the job',
//       });
//     }
//   }, [dispatch, job._id, toast]);

//   const formattedDescription = useMemo(() => {
//     const desc = job?.description || '';
//     return desc
//       .replace(/^(.*?):\s*$/gm, '### $1')
//       .replace(/•\s*/g, '- ')
//       .replace(/\n\s*\n/g, '\n\n');
//   }, [job?.description]);

//   if (!job) {
//     return (
//       <div className="flex items-center justify-center h-full text-muted-foreground">
//         <p>Select a job to see the details</p>
//       </div>
//     );
//   }

//   const normalizeText = (text: string) => {
//     if (!text) return '';
//     return text
//       .replace(/[•▪◦‣]/g, '-')
//       .replace(/\r\n/g, '\n')
//       .replace(/\n{2,}/g, '\n\n');
//   };

//   const KNOWN_HEADINGS = [
//     'job description',
//     'responsibilities',
//     'requirements',
//     'qualification',
//     'qualifications',
//     'skills',
//     'skills required',
//     'experience',
//     'location',
//     'about the role',
//     'about us',
//     'what you will do',
//     'what we are looking for',
//   ];

//   const isHeading = (line: string, nextLine?: string) => {
//     const trimmed = line.trim();
//     const lower = trimmed.toLowerCase();

//     if (!trimmed) return false;

//     // 1️⃣ Ends with colon
//     if (trimmed.endsWith(':')) return true;

//     // 2️⃣ Known headings
//     if (KNOWN_HEADINGS.includes(lower)) return true;

//     // 3️⃣ Short Title Case (Responsibilities, Requirements)
//     if (trimmed.split(' ').length <= 4 && /^[A-Z][A-Za-z\s]+$/.test(trimmed)) {
//       return true;
//     }

//     // 4️⃣ ALL CAPS heading
//     if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
//       return true;
//     }

//     // 5️⃣ Followed by bullet points
//     if (nextLine?.trim().startsWith('-')) return true;

//     return false;
//   };

//   const renderJobDescription = (text: string) => {
//     const lines = text.split('\n');

//     const isHtml = /<[a-z][\s\S]*>/i.test(text);
//     if (isHtml) {
//       // 2. If it is HTML, render it directly (bypass cleaning)
//       return (
//         <div
//           className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
//           dangerouslySetInnerHTML={{ __html: text }}
//         />
//       );
//     }
//     return lines.map((line, index) => {
//       const trimmed = line.trim();
//       const nextLine = lines[index + 1];

//       if (!trimmed) {
//         return <div key={index} className="h-2" />;
//       }

//       // ✅ Heading
//       // if (isHeading(trimmed, nextLine)) {
//       //   return (
//       //     <div
//       //       key={index}
//       //       className="mt-5 mb-2 font-semibold text-slate-800 text-sm uppercase tracking-wide"
//       //     >
//       //       {trimmed.replace(/:$/, '')}
//       //     </div>
//       //   );
//       // }

//       // ✅ Bullet point
//       if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
//         return (
//           <div
//             key={index}
//             className="ml-4 flex items-start gap-2 text-sm text-slate-600"
//           >
//             <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
//             <span>{trimmed.replace(/^[-•]/, '').trim()}</span>
//           </div>
//         );
//       }

//       // ✅ Normal paragraph
//       return (
//         <p key={index} className="text-sm text-slate-600 leading-relaxed">
//           {trimmed}
//         </p>
//       );
//     });
//   };

//   const handleGetATSScore = useCallback(async () => {
//     // if (!profile.uploadedCV) {
//     //   toast({
//     //     title: 'CV not found',
//     //     description: 'Please upload or select a CV to calculate ATS Score.',
//     //     variant: 'destructive',
//     //   });
//     //   return;
//     // }
//     if (!job?.description) return;

//     setIsLoadingAtsScore(true);
//     setAtsScore(null);
//     setScoreError(null);
//     setProgress(0);

//     const controller = new AbortController();
//     const { signal } = controller;

//     let interval = window.setInterval(() => {
//       setProgress((prev) => (prev < 90 ? prev + 5 : prev));
//     }, 1000);

//     try {
//       const response = await apiInstance.post(
//         '/students/ats-score',
//         { jobDescription: job.description },
//         { signal },
//       );

//       if (signal.aborted) return;

//       setProgress(100);
//       setAtsScore(response.data); // assuming same structure
//       if (job._id) {
//         localStorage.setItem(
//           `atsScore_${job._id}`,
//           JSON.stringify(response.data),
//         );
//       }
//       if (!response.success) {
//         toast({
//           title: 'Success',
//           description: 'ATS score calculated successfully',
//         });
//       }

//       if (response.status === 429) {
//         toast({
//           title: 'Rate limit exceeded',
//           description: 'Please Upgrade your plan to use AI Match Score.',
//         });
//       }
//     } catch (error) {
//       if (!signal.aborted) {
//         toast({
//           title: 'Could not calculate the AI  score.',
//           description: error.response.data.message,
//         });
//         console.error('ATS score error:', error);
//         setProgress(0);
//         setScoreError('Failed to calculate ATS Score');
//       }
//     } finally {
//       clearInterval(interval);
//       setIsLoadingAtsScore(false);
//     }
//   }, [job?._id, job?.description]);

//   const handleApplyNow = () => {
//     router.replace(`/dashboard/jobs/${job._id}/apply`);
//   };

//   // const cleanHtmlDescription = (content: string) => {
//   //   if (!content) return '';

//   //   return (
//   //     content
//   //       // 1. Convert block-ending tags to newlines to preserve layout
//   //       .replace(/<\/p>/gi, '\n')
//   //       .replace(/<br\s*\/?>/gi, '\n')
//   //       .replace(/<\/div>/gi, '\n')
//   //       .replace(/<\/li>/gi, '\n')
//   //       // 2. Strip start tags and any other remaining tags
//   //       .replace(/<[^>]+>/g, '')
//   //       // 3. Decode common HTML entities
//   //       .replace(/&amp;/g, '&')
//   //       .replace(/&nbsp;/g, ' ')
//   //       .replace(/&lt;/g, '<')
//   //       .replace(/&gt;/g, '>')
//   //       // 4. Remove excessive multiple newlines (optional, but looks cleaner)
//   //       .replace(/\n\s*\n\s*\n/g, '\n\n')
//   //   );
//   // };

//   // Helper to convert HTML-like strings to the plain text format your renderer expects
//   const cleanHtmlDescription = (content: string) => {
//     if (!content) return '';
//     const isHtml = /<[a-z][\s\S]*>/i.test(content);
//     if (isHtml) {
//       return content;
//     }
//     return content

//       .replace(/<\/p>/gi, '\n')
//       .replace(/<br\s*\/?>/gi, '\n')
//       .replace(/<\/div>/gi, '\n')
//       .replace(/<\/li>/gi, '\n')
//       .replace(/<[^>]+>/g, '')
//       .replace(/&amp;/g, '&')
//       .replace(/&nbsp;/g, ' ')
//       .replace(/&lt;/g, '<')
//       .replace(/&gt;/g, '>')
//       .replace(/\n\s*\n\s*\n/g, '\n\n');
//   };

//   return (
//     <div className="animate-in slide-in-from-left-5 min-h-screen space-y-4 transition-all duration-300 fade-in  ">
//       {/* Header */}
//       <div className="relative overflow-hidden rounded-[30px] border border-slate-200 ]">
//         <div className="absolute inset-0 " />
//         <div className="relative p-5 text-black md:p-6">
//           <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between ">
//             <div className="flex-1 space-y-4">
//               <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-50">
//                 Job Overview
//               </div>
//               <h1 className="mb-3 text-2xl font-semibold leading-tight md:text-3xl">
//                 {job.title}
//               </h1>
//               <div className="flex flex-wrap items-center gap-3 text-xs text-black">
//                 <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
//                   <Building2 className="w-4 h-4" />
//                   <span className="font-semibold">{job.company}</span>
//                 </div>
//                 <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
//                   <MapPin className="w-4 h-4" />
//                   <span>
//                     {(() => {
//                       const NOISE = [
//                         'anywhere',
//                         'remote',
//                         'worldwide',
//                         'global',
//                         'online',
//                         'virtual',
//                       ];
//                       const rawCity = job.location?.city?.trim() ?? '';
//                       const city = NOISE.includes(rawCity.toLowerCase())
//                         ? ''
//                         : rawCity;
//                       const state =
//                         (job.location as any)?.state?.trim?.() ?? '';
//                       const country =
//                         (job.country as string | undefined)?.trim() ?? '';
//                       const parts: string[] = [];
//                       if (city) parts.push(city);
//                       if (state && state !== city) parts.push(state);
//                       if (country) parts.push(country);
//                       if (parts.length > 0) return parts.join(', ');
//                       if ((job as any).remote) return 'Remote';
//                       return 'Location not specified';
//                     })()}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
//                   <Briefcase className="w-4 h-4" />
//                   <span className="capitalize">
//                     {job?.jobTypes?.[0] || 'Not specified'}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col flex-wrap items-stretch gap-3 sm:flex-row md:w-auto md:flex-col">
//               <Button
//                 onClick={handleToggleSavedJob}
//                 className={`group relative rounded-2xl px-6 py-3 font-semibold transition-all duration-300 ${
//                   isSaved
//                     ? 'border border-white/30 bg-white/20 text-white shadow-lg shadow-cyan-950/20 hover:bg-white/30'
//                     : 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm">
//                     {isSaved ? 'Saved' : 'Save Job'}
//                   </span>
//                   {isSaved ? (
//                     <HeartOff className="w-5 h-5 transition-transform group-hover:scale-110" />
//                   ) : (
//                     <Heart className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-current" />
//                   )}
//                 </div>
//               </Button>

//               <Button
//                 onClick={async () => {
//                   const shareData = {
//                     title: job.title,
//                     text: `Check out this job: ${job.title}`,
//                     url: `https://zobsai.com/jobs/${job.slug}`,
//                   };

//                   try {
//                     // Check if the browser supports the native share menu
//                     if (navigator.share) {
//                       await navigator.share(shareData);
//                     } else {
//                       // Fallback for desktop/unsupported browsers: Copy to clipboard
//                       await navigator.clipboard.writeText(shareData.url);
//                       toast({
//                         variant: 'success',
//                         title: 'Link copied to clipboard',
//                         description: 'Share it anywhere!',
//                       });
//                     }
//                   } catch (err) {
//                     console.error('Error sharing:', err);
//                   }
//                 }}
//                 className="group relative rounded-2xl border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/20"
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm">Share Job</span>
//                   <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
//                 </div>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
//         {/* <div className="flex flex-col md:flex-row items-stretch gap-4 px-6"> */}
//         <div className="flex flex-wrap items-center gap-4 px-1 sm:px-2">
//           {/* Logo */}
//           <div className="flex items-center justify-center md:justify-start">
//             {job.logo ? (
//               <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//                 <Image
//                   src={job.logo}
//                   alt={job.company || 'Company Logo'}
//                   fill
//                   sizes="48px"
//                   className="object-contain p-2"
//                 />
//               </div>
//             ) : (
//               <Image
//                 src="/logo.png"
//                 alt="Company Logo"
//                 width={56}
//                 height={56}
//                 className="rounded-2xl border border-slate-200 bg-white object-contain p-2 shadow-sm"
//               />
//             )}
//           </div>

//           {token ? (
//             // <div className="flex flex-col flex-wrap justify-end md:flex-row gap-2 items-center flex-1 md:gap-4">
//             <div className="flex flex-1 flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:justify-end">
//               {/* Tailor & Apply */}
//               {job.applyMethod?.url === 'email' ? (
//                 <Button
//                   asChild
//                   className="rounded-2xl border-0 bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
//                 >
//                   <Link
//                     href={`/dashboard/apply?slug=${encodeURIComponent(
//                       job._id ?? '',
//                     )}&step=cv`}
//                   >
//                     <div className="flex items-center justify-center gap-2">
//                       <FilePlus2 className="w-5 h-5" />
//                       <span>Tailor & Apply</span>
//                     </div>
//                   </Link>
//                 </Button>
//               ) : (
//                 <Button
//                   asChild
//                   className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
//                 >
//                   <Link
//                     href={`/dashboard/apply?slug=${encodeURIComponent(
//                       job._id ?? '',
//                     )}&step=cv`}
//                   >
//                     <div className="flex items-center justify-center gap-2">
//                       <FilePlus2 className="w-5 h-5" />
//                       <span>Tailor My Docs</span>
//                     </div>
//                   </Link>
//                 </Button>
//               )}

//               {/* Company Site */}
//               {job.origin === 'EXTERNAL' &&
//               job.applyMethod.url &&
//               job.applyMethod.url !== 'email' ? (
//                 <Button
//                   onClick={handleApplyOnSite}
//                   asChild
//                   variant="outline"
//                   className="rounded-2xl border-sky-200 bg-sky-50 px-5 py-3 font-semibold text-sky-700 transition-all duration-300 hover:bg-sky-100"
//                 >
//                   <Link
//                     href={job.applyMethod.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     <div className="flex items-center justify-center gap-2">
//                       <ExternalLink className="w-5 h-5" />
//                       <span>Apply on Company Site</span>
//                     </div>
//                   </Link>
//                 </Button>
//               ) : isApplying ? (
//                 <Button
//                   disabled
//                   className="flex cursor-not-allowed items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white opacity-90"
//                 >
//                   <div className="relative flex items-center justify-center gap-2">
//                     <CheckCircle className="w-5 h-5" />
//                     <span>Applied</span>
//                   </div>
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={handleApplyNow}
//                   asChild
//                   className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
//                 >
//                   <Link
//                     href={`/dashboard/jobs/${job._id}/apply`}
//                     rel="noopener noreferrer"
//                   >
//                     <div className="flex items-center justify-center gap-2">
//                       <span>Apply Now</span>
//                     </div>
//                   </Link>
//                 </Button>
//               )}

//               {/* ATS Score */}
//               {!atsScore && !isLoadingAtsScore && (
//                 <Button
//                   onClick={handleGetATSScore}
//                   className="rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-sky-700"
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     <Sparkles className="w-5 h-5" />
//                     <span>AI ATS Score</span>
//                   </div>
//                 </Button>
//               )}

//               {isLoadingAtsScore && (
//                 <div className="relative w-[110px] overflow-hidden rounded-2xl bg-sky-600 px-6 py-2 text-white">
//                   <div
//                     className="absolute inset-y-0 left-0 bg-white/30 transition-all duration-300"
//                     style={{ width: `${progress}%` }}
//                   />
//                   <div className="relative flex items-center justify-center gap-2">
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     <span className="font-semibold tabular-nums w-[3ch] text-center">
//                       {progress}%
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {atsScore && !isLoadingAtsScore && (
//                 <button
//                   onClick={handleGetATSScore}
//                   className="rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-sky-700"
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     <TrendingUp className="w-4 h-4" />
//                     <span>{atsScore?.atsScore}/100</span>
//                   </div>
//                 </button>
//               )}

//               {isLoadingScore && (
//                 <div className="relative w-[110px] overflow-hidden rounded-2xl bg-slate-900 px-6 py-2 text-white">
//                   <div
//                     className="absolute inset-y-0 left-0 bg-white/30 transition-all duration-300"
//                     style={{ width: `${progress}%` }}
//                   />
//                   <div className="relative flex items-center justify-center gap-2">
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     <span className="font-semibold tabular-nums w-[3ch] text-center">
//                       {progress}%
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Match Score */}
//               {!matchScore && !isLoadingScore && (
//                 <Button
//                   onClick={handleGetMatchScore}
//                   className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     <Sparkles className="w-5 h-5" />
//                     <span>AI Match Score</span>
//                   </div>
//                 </Button>
//               )}

//               {matchScore && !isLoadingScore && (
//                 <button
//                   onClick={handleGetMatchScore}
//                   className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     <TrendingUp className="w-4 h-4" />
//                     <span>{matchScore.matchScore}/10</span>
//                   </div>
//                 </button>
//               )}

//               {savedCvs.length > 0 && (
//                 <Select value={cvForMatch} onValueChange={setCvForMatch}>
//                   <SelectTrigger className="h-11 w-[190px] rounded-2xl border border-slate-200 bg-white text-sm">
//                     <SelectValue placeholder="Match against" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white text-sm">
//                     <SelectItem value="profile">My Profile</SelectItem>
//                     {savedCvs.map((cv) => (
//                       <SelectItem key={cv._id} value={cv._id}>
//                         {cv.htmlCVTitle || 'Untitled CV'}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}

//               {/* {scoreError && !isLoadingScore && (
//                 <Button
//                   onClick={handleGetMatchScore}
//                   variant="outline"
//                   className="border-red-300 text-red-600 hover:bg-red-500 hover:text-white"
//                 >
//                   Retry Match Score
//                 </Button>
//               )} */}
//             </div>
//           ) : (
//             <div className="flex flex-1 flex-col items-center justify-end gap-2 md:flex-row md:gap-4">
//               <Button
//                 onClick={() => router.push('/login')}
//                 className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
//               >
//                 Sign up
//                 <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex items-center justify-end">
//         <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
//           {atsScore?.atsScore && (
//             <button
//               onClick={() => {
//                 setActiveView('ats');
//                 setOpenCard(null);
//               }}
//               className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
//                 activeView === 'ats'
//                   ? 'bg-sky-50 text-sky-700 shadow-sm'
//                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
//               }`}
//             >
//               <Zap className="w-4 h-4" />
//               <span>ATS Score :</span>
//               <span className="text-xs font-bold">{atsScore.atsScore}</span>
//             </button>
//           )}

//           {matchScore && !isLoadingScore && (
//             <button
//               onClick={() => {
//                 setActiveView('match');
//                 setOpenCard(null);
//               }}
//               className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
//                 activeView === 'match'
//                   ? 'bg-slate-900 text-white shadow-sm'
//                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
//               }`}
//             >
//               <Star className="w-4 h-4" />
//               <span>Match Score :</span>
//               <span className="text-xs font-bold">{matchScore.matchScore}</span>
//             </button>
//           )}
//         </div>
//       </div>

//       {activeView === 'match' && matchScore && !isLoadingScore && (
//         <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
//           {/* Header with main score */}
//           <button
//             onClick={() => setOpenCard(openCard === 'match' ? null : 'match')}
//             className="flex w-full items-center justify-between px-5 py-5 text-left transition-colors hover:bg-slate-50"
//           >
//             <div className="flex items-center gap-4">
//               <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 shadow-lg shadow-slate-900/15">
//                 <span className="text-xl font-bold text-white">
//                   {matchScore.matchScore}
//                 </span>
//                 <span className="absolute -bottom-1 -right-1 rounded bg-white px-1.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
//                   /10
//                 </span>
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-slate-900">
//                   AI Match Score
//                 </p>
//                 <p className="text-xs text-slate-500">
//                   {matchScore.matchScore >= 7
//                     ? 'Strong match'
//                     : matchScore.matchScore >= 4
//                       ? 'Moderate match'
//                       : 'Consider upskilling'}
//                 </p>
//               </div>
//             </div>
//             {openCard === 'match' ? (
//               <ChevronUp className="w-5 h-5 text-slate-500" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-slate-500" />
//             )}
//           </button>

//           {/* Expandable content */}
//           {openCard === 'match' && (
//             <div className="space-y-4 border-t border-slate-100 px-5 pb-5">
//               {/* Fit breakdown - matches job description against CV for any job type */}
//               {((matchScore.skillsFitPercent ?? matchScore.techFitPercent) !==
//                 undefined ||
//                 (matchScore.experienceFitPercent ??
//                   matchScore.roleFitPercent) !== undefined ||
//                 matchScore.seniorityFitPercent !== undefined) && (
//                 <div className="space-y-3 pt-4">
//                   <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
//                     <BarChart3 className="w-4 h-4 text-sky-600" />
//                     Match breakdown
//                   </h3>
//                 </div>
//               )}

//               {/* Suggestions */}

//               {/* Recommendation */}
//               <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
//                 <h3 className="mb-2 text-sm font-semibold text-slate-800">
//                   Recommendation
//                 </h3>
//                 <p className="text-sm leading-relaxed text-slate-700">
//                   {matchScore.recommendation}
//                 </p>
//               </div>

//               {matchScore.improvedSummary && (
//                 <details className="group">
//                   <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-800 hover:text-sky-700">
//                     <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
//                     Improved resume summary
//                   </summary>
//                   <p className="mt-2 pl-6 text-sm leading-relaxed text-slate-600">
//                     {matchScore.improvedSummary}
//                   </p>
//                 </details>
//               )}

//               {/* Generate Tailored Docs */}
//               <div className="border-t border-slate-100 pt-4">
//                 <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
//                   <FilePlus2 className="w-4 h-4 text-sky-600" />
//                   Generate tailored docs
//                 </h3>
//                 <div className="flex flex-wrap gap-2">
//                   <Button
//                     asChild
//                     size="sm"
//                     variant="outline"
//                     className="rounded-xl border-slate-200 hover:bg-slate-50"
//                   >
//                     <Link
//                       href={`/dashboard/cv-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cv`}
//                     >
//                       <FileText className="w-4 h-4 mr-1.5" />
//                       CV
//                     </Link>
//                   </Button>
//                   <Button
//                     asChild
//                     size="sm"
//                     variant="outline"
//                     className="rounded-xl border-slate-200 hover:bg-slate-50"
//                   >
//                     <Link
//                       href={`/dashboard/cover-letter-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cl`}
//                     >
//                       <FileSignature className="w-4 h-4 mr-1.5" />
//                       Cover Letter
//                     </Link>
//                   </Button>
//                   <Button
//                     asChild
//                     size="sm"
//                     className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
//                   >
//                     <Link
//                       href={`/dashboard/apply?slug=${encodeURIComponent(job._id ?? '')}&step=cv`}
//                     >
//                       <FilePlus2 className="w-4 h-4 mr-1.5" />
//                       Both
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Always show recommendation and generate CTA when collapsed */}
//           {openCard !== 'match' && (
//             <div className="space-y-3 border-t border-slate-100 px-5 pb-5 pt-3">
//               <p className="line-clamp-2 text-sm text-slate-700">
//                 {matchScore.recommendation}
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 <Button
//                   asChild
//                   size="sm"
//                   variant="outline"
//                   className="h-8 rounded-xl border-slate-200 text-xs hover:bg-slate-50"
//                 >
//                   <Link
//                     href={`/dashboard/cv-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cv`}
//                   >
//                     <FileText className="w-3.5 h-3.5 mr-1" /> CV
//                   </Link>
//                 </Button>
//                 <Button
//                   asChild
//                   size="sm"
//                   variant="outline"
//                   className="h-8 rounded-xl border-slate-200 text-xs hover:bg-slate-50"
//                 >
//                   <Link
//                     href={`/dashboard/cover-letter-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cl`}
//                   >
//                     <FileSignature className="w-3.5 h-3.5 mr-1" /> Cover Letter
//                   </Link>
//                 </Button>
//                 <Button
//                   asChild
//                   size="sm"
//                   className="h-8 rounded-xl bg-slate-900 text-xs text-white hover:bg-slate-800"
//                 >
//                   <Link
//                     href={`/dashboard/apply?slug=${encodeURIComponent(job._id ?? '')}&step=cv`}
//                   >
//                     <FilePlus2 className="w-3.5 h-3.5 mr-1" /> Generate Both
//                   </Link>
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {activeView === 'ats' && atsScore && !isLoadingAtsScore && (
//         <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
//           <button
//             onClick={() => setOpenCard(openCard === 'ats' ? null : 'ats')}
//             className="flex w-full items-center justify-between px-5 py-4 hover:bg-slate-50"
//           >
//             <div className="flex items-center gap-4">
//               <div className="rounded-xl bg-sky-600 p-2.5">
//                 <Zap className="w-4 h-4 text-white" />
//               </div>
//               <div className="flex gap-2 text-sm text-slate-600">
//                 <span>ATS Score:</span>
//                 <span className="font-semibold text-sky-700">
//                   {atsScore.atsScore}/100
//                 </span>
//               </div>
//             </div>

//             {/* {openCard === 'ats' ? (
//               <ChevronUp className="w-5 h-5 text-primary" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-primary" />
//             )} */}
//           </button>
//           {/*
//           {openCard === 'ats' && (
//             <div className="px-3 pb-3">
//               <div className="bg-white/80 rounded-xl p-3 border">
//                 <h2 className="font-semibold mb-1">ATS Suggestions</h2>
//                 <p className="text-sm text-gray-700">{atsScore.suggestions}</p>
//               </div>
//             </div>
//           )} */}

//           <div className="px-5 pb-5">
//             <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
//               <h2 className="font-semibold mb-1">ATS Suggestions</h2>
//               <p className="text-sm text-slate-700">{atsScore.suggestions}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Description */}
//       <div
//         id="jobDescription"
//         className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.07)]"
//       >
//         <div className="mb-4 flex items-center gap-3">
//           <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-slate-900 via-sky-700 to-cyan-500" />
//           <h2 className="text-lg font-bold text-slate-900 md:text-xl">
//             Job Description
//           </h2>
//         </div>

//         <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
//           <details
//             open
//             className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
//           >
//             <summary className="hidden" />
//             <div className="px-1 pb-4">
//               {/* {renderJobDescription(cleanHtmlDescription(job.description))} */}
//               {job.description ? (
//                 renderJobDescription(job.description)
//               ) : (
//                 <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
//                   <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
//                     <FileText className="h-8 w-8 text-slate-400" />
//                   </div>
//                   <h3 className="mb-2 text-sm font-medium text-slate-700">
//                     No job description provided
//                   </h3>
//                 </div>
//               )}
//               {/* {renderJobDescription(job.description)} */}
//             </div>
//           </details>
//         </div>
//       </div>

//       {/* Highlights */}
//       {job.highlights &&
//         Object.entries(job.highlights).map(([title, items], index) => (
//           <div
//             key={title}
//             className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.10)]"
//           >
//             <div className="mb-5 flex items-center gap-3">
//               <div
//                 className={`h-10 w-1.5 rounded-full ${
//                   index % 2 === 0
//                     ? 'bg-gradient-to-b from-slate-900 via-sky-700 to-cyan-500'
//                     : 'bg-gradient-to-b from-emerald-700 via-teal-600 to-cyan-500'
//                 }`}
//               />
//               <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
//                 {title}
//               </h3>
//             </div>

//             <div className="grid gap-4">
//               {(items as string[]).map((item, idx) => (
//                 <div
//                   key={`${title}-${idx}`}
//                   className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-all duration-300 hover:border-sky-200 hover:bg-sky-50/60"
//                 >
//                   <div className="mt-0.5 flex-shrink-0">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-105">
//                       <CheckCircle className="h-5 w-5 text-white" />
//                     </div>
//                   </div>
//                   <span className="flex-1 text-base leading-relaxed text-slate-700">
//                     {item}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}

//       <MatchScoreModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         isLoading={isLoadingScore}
//         scoreData={matchScore}
//         error={scoreError}
//       />
//     </div>
//   );
// }

// 'use client';

// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { useDispatch } from 'react-redux';

// import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';
// import apiInstance from '@/services/api';
// import { MatchScoreModal } from './MatchScoreModal';

// import {
//   savedStudentJobsRequest,
//   visitedJobsRequest,
// } from '@/redux/reducers/jobReducer';
// import { useProfile } from '@/hooks/useProfile';

// import {
//   FilePlus2,
//   CheckCircle,
//   Heart,
//   ExternalLink,
//   Sparkles,
//   Loader2,
//   HeartOff,
//   MapPin,
//   Briefcase,
//   Building2,
//   TrendingUp,
//   Star,
//   Zap,
//   Share2,
//   ChevronDown,
//   ChevronUp,
//   Briefcase as BriefcaseIcon,
//   BarChart3,
//   Lightbulb,
//   Target,
//   FileText,
//   FileSignature,
// } from 'lucide-react';

// import { JobListing } from '@/lib/data/jobs';
// import { postStudentEventsRequest } from '@/redux/reducers/studentReducer';

// import { getToken } from '@/hooks/useToken';
// import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// interface JobDetailClientProps {
//   job: JobListing;
// }

// interface MatchScore {
//   matchScore: number;
//   skillsFitPercent?: number;
//   experienceFitPercent?: number;
//   seniorityFitPercent?: number;
//   techFitPercent?: number;
//   roleFitPercent?: number;
//   breakdown?: { skills: string; experience: string; seniority: string };
//   skillsMatched?: { skill: string }[];
//   skillsMissing?: string[];
//   suggestions?: string[];
//   recommendation: string;
//   improvedSummary?: string;
// }

// interface AtsScore {
//   atsScore: number;
//   suggestions: string;
//   improvedResumeSummary: string;
// }

// function getCookie(name: string): string | undefined {
//   if (typeof document === 'undefined') return undefined;
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop()?.split(';').shift();
//   return undefined;
// }

// export default function JobDetail({ job }: JobDetailClientProps) {
//   const { toast } = useToast();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { profile } = useProfile();

//   const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
//   const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
//   const [isLoadingScore, setIsLoadingScore] = useState(false);
//   const [isLoadingAtsScore, setIsLoadingAtsScore] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [scoreError, setScoreError] = useState<string | null>(null);
//   const [activeView, setActiveView] = useState<'match' | 'ats'>('match');
//   const [isApplying, setIsApplying] = useState(false);
//   const [openCard, setOpenCard] = useState<'match' | 'ats' | null>('match');
//   const [token, setToken] = useState<string | undefined>(undefined);
//   const [savedCvs, setSavedCvs] = useState<
//     { _id: string; htmlCVTitle?: string }[]
//   >([]);
//   const [cvForMatch, setCvForMatch] = useState<string>('profile');

//   const MATCH_SCORE_KEY = (jobId?: string) =>
//     jobId ? `matchScore_${jobId}` : '';

//   const ATS_SCORE_KEY = (jobId?: string) => (jobId ? `atsScore_${jobId}` : '');

//   useEffect(() => {
//     try {
//       const accessToken = getToken();
//       setToken(accessToken || undefined);
//     } catch {
//       setToken(undefined);
//     }
//   }, []);

//   useEffect(() => {
//     if (!token) return;
//     const fetchCvs = async () => {
//       try {
//         const res = await apiInstance.get('/students/resume/saved');
//         const list = res.data?.html || res.data || [];
//         setSavedCvs(Array.isArray(list) ? list : []);
//       } catch {
//         setSavedCvs([]);
//       }
//     };
//     fetchCvs();
//   }, [token]);

//   useEffect(() => {
//     if (!job?._id) return;

//     const controller = new AbortController();
//     const matchCacheKey =
//       cvForMatch && cvForMatch !== 'profile'
//         ? `matchScore_${job._id}_${cvForMatch}`
//         : MATCH_SCORE_KEY(job._id);

//     try {
//       const rawMatch = localStorage.getItem(matchCacheKey);
//       const parsedMatch = rawMatch ? JSON.parse(rawMatch) : null;

//       if (parsedMatch && typeof parsedMatch.matchScore === 'number') {
//         setMatchScore(parsedMatch);
//       } else {
//         setMatchScore(null);
//         localStorage.removeItem(matchCacheKey);
//       }
//     } catch {
//       setMatchScore(null);
//       localStorage.removeItem(matchCacheKey);
//     }

//     setIsLoadingScore(false);
//     setProgress(0);

//     // ----- ATS SCORE -----
//     try {
//       const rawAts = localStorage.getItem(ATS_SCORE_KEY(job._id));
//       const parsedAts = rawAts ? JSON.parse(rawAts) : null;

//       if (parsedAts && typeof parsedAts.atsScore === 'number') {
//         setAtsScore(parsedAts);
//       } else {
//         setAtsScore(null);
//         localStorage.removeItem(ATS_SCORE_KEY(job._id));
//       }
//     } catch {
//       setAtsScore(null);
//       localStorage.removeItem(ATS_SCORE_KEY(job._id));
//     }

//     setIsLoadingScore(false);
//     setIsLoadingAtsScore(false);
//     setProgress(0);

//     return () => controller.abort();
//   }, [job?._id, cvForMatch]);

//   useEffect(() => {
//     if (!job?._id) return;

//     const controller = new AbortController();
//     const { signal } = controller;

//     const cacheKey =
//       cvForMatch && cvForMatch !== 'profile'
//         ? `matchScore_${job._id}_${cvForMatch}`
//         : `matchScore_${job._id}`;
//     const savedScore = localStorage.getItem(cacheKey);
//     setMatchScore(savedScore ? (JSON.parse(savedScore) as MatchScore) : null);
//     setIsLoadingScore(false);
//     setProgress(0);

//     const checkJobStatus = async () => {
//       try {
//         const savedRes = await apiInstance.get(
//           '/students/jobs/intraction-status',
//           { params: { jobId: job._id }, signal },
//         );

//         if (signal.aborted) return;
//         setIsSaved(Boolean(savedRes?.data?.saved));
//         setIsApplying(Boolean(savedRes?.data?.applied));
//       } catch (error) {
//         if (!signal.aborted) {
//           console.error('Failed to check job status:', error);
//         }
//       }
//     };

//     checkJobStatus();
//     return () => controller.abort();
//   }, [job?._id, cvForMatch]);

//   const handleToggleSavedJob = useCallback(async () => {
//     try {
//       await dispatch(savedStudentJobsRequest(job._id) as any);
//       setIsSaved((prev) => !prev);
//       toast({
//         title: isSaved ? 'Job Unsaved' : 'Job Saved!',
//         description: isSaved
//           ? 'You have removed this job from your saved list.'
//           : 'You have successfully saved this job.',
//       });
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Something went wrong. Please try again.',
//       });
//     }
//   }, [dispatch, job._id, isSaved, toast]);

//   const handleGetMatchScore = useCallback(async () => {
//     if (!job?.description) return;
//     setIsLoadingScore(true);
//     setMatchScore(null);
//     setScoreError(null);
//     setProgress(0);

//     const controller = new AbortController();
//     const { signal } = controller;

//     let interval: number | undefined;
//     interval = window.setInterval(() => {
//       setProgress((prev) => (prev < 90 ? prev + 5 : prev));
//     }, 1000);

//     const payload: Record<string, string> = {
//       jobDescription: job.description,
//       jobTitle: job.title || '',
//     };
//     if (cvForMatch && cvForMatch !== 'profile') {
//       payload.savedCVId = cvForMatch;
//     }

//     try {
//       const response = await apiInstance.post(
//         '/students/calculate-match',
//         payload,
//         { signal },
//       );

//       if (signal.aborted) return;
//       setProgress(100);
//       const data = response.data as MatchScore;
//       setMatchScore(data);
//       if (job._id) {
//         const cacheKey =
//           cvForMatch && cvForMatch !== 'profile'
//             ? `matchScore_${job._id}_${cvForMatch}`
//             : `matchScore_${job._id}`;
//         localStorage.setItem(cacheKey, JSON.stringify(data));
//       }

//       if (!response.success) {
//         toast({
//           title: 'Success',
//           description: 'Successfully calculated the AI match score.',
//         });
//       }

//       if (response.status === 429) {
//         toast({
//           title: 'Rate limit exceeded',
//           description: 'Please Upgrade your plan to use AI Match Score.',
//         });
//       }
//     } catch (error: any) {
//       toast({
//         title: 'Could not calculate the AI score.',
//         description: error.response?.data?.message || 'Something went wrong',
//       });
//       setProgress(0);
//       setScoreError('Could not calculate the AI match score.');
//     } finally {
//       if (interval) window.clearInterval(interval);
//       setIsLoadingScore(false);
//     }
//   }, [job?._id, job?.description, cvForMatch]);

//   const handleApplyOnSite = useCallback(async () => {
//     try {
//       dispatch(
//         postStudentEventsRequest({ jobId: job._id || job.slug, type: 'VISIT' }),
//       );
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to apply for the job',
//       });
//     }
//   }, [dispatch, job._id, toast]);

//   const handleGetATSScore = useCallback(async () => {
//     if (!job?.description) return;

//     setIsLoadingAtsScore(true);
//     setAtsScore(null);
//     setScoreError(null);
//     setProgress(0);

//     const controller = new AbortController();
//     const { signal } = controller;

//     let interval = window.setInterval(() => {
//       setProgress((prev) => (prev < 90 ? prev + 5 : prev));
//     }, 1000);

//     try {
//       const response = await apiInstance.post(
//         '/students/ats-score',
//         { jobDescription: job.description },
//         { signal },
//       );

//       if (signal.aborted) return;

//       setProgress(100);
//       setAtsScore(response.data);
//       if (job._id) {
//         localStorage.setItem(
//           `atsScore_${job._id}`,
//           JSON.stringify(response.data),
//         );
//       }
//       if (!response.success) {
//         toast({
//           title: 'Success',
//           description: 'ATS score calculated successfully',
//         });
//       }

//       if (response.status === 429) {
//         toast({
//           title: 'Rate limit exceeded',
//           description: 'Please Upgrade your plan to use AI Match Score.',
//         });
//       }
//     } catch (error: any) {
//       if (!signal.aborted) {
//         toast({
//           title: 'Could not calculate the AI score.',
//           description: error.response?.data?.message || 'Something went wrong',
//         });
//         console.error('ATS score error:', error);
//         setProgress(0);
//         setScoreError('Failed to calculate ATS Score');
//       }
//     } finally {
//       clearInterval(interval);
//       setIsLoadingAtsScore(false);
//     }
//   }, [job?._id, job?.description]);

//   const handleApplyNow = () => {
//     router.replace(`/dashboard/jobs/${job._id}/apply`);
//   };

//   const renderJobDescription = (text: string) => {
//     const lines = text.split('\n');
//     const isHtml = /<[a-z][\s\S]*>/i.test(text);
//     if (isHtml) {
//       return (
//         <div
//           className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
//           dangerouslySetInnerHTML={{ __html: text }}
//         />
//       );
//     }
//     return lines.map((line, index) => {
//       const trimmed = line.trim();
//       if (!trimmed) {
//         return <div key={index} className="h-2" />;
//       }
//       if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
//         return (
//           <div
//             key={index}
//             className="ml-4 flex items-start gap-2 text-sm text-slate-600"
//           >
//             <span className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
//             <span>{trimmed.replace(/^[-•]/, '').trim()}</span>
//           </div>
//         );
//       }
//       return (
//         <p key={index} className="text-sm text-slate-600 leading-relaxed mb-4">
//           {trimmed}
//         </p>
//       );
//     });
//   };

//   if (!job) {
//     return (
//       <div className="flex items-center justify-center h-full text-muted-foreground">
//         <p>Select a job to see the details</p>
//       </div>
//     );
//   }

//   const locationString = (() => {
//     const NOISE = [
//       'anywhere',
//       'remote',
//       'worldwide',
//       'global',
//       'online',
//       'virtual',
//     ];
//     const rawCity = job.location?.city?.trim() ?? '';
//     const city = NOISE.includes(rawCity.toLowerCase()) ? '' : rawCity;
//     const state = (job.location as any)?.state?.trim?.() ?? '';
//     const country = (job.country as string | undefined)?.trim() ?? '';
//     const parts: string[] = [];
//     if (city) parts.push(city);
//     if (state && state !== city) parts.push(state);
//     if (country) parts.push(country);
//     if (parts.length > 0) return parts.join(', ');
//     if ((job as any).remote) return 'Remote';
//     return 'Location not specified';
//   })();

//   return (
//     <section className="custom-scrollbar relative flex flex-1 flex-col overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-sm h-full">
//       {/* Top Header Section */}
//       <div className="shrink-0 bg-white px-8 pt-8 pb-6">
//         <div className="flex items-start justify-between gap-6">
//           <div className="flex items-start gap-5">
//             <div className="mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-slate-200 bg-white p-2 shadow-sm overflow-hidden relative">
//               {job.logo ? (
//                 <Image
//                   src={job.logo}
//                   alt={job.company || 'Company Logo'}
//                   fill
//                   sizes="64px"
//                   className="object-contain p-2"
//                 />
//               ) : (
//                 <span className="text-xs font-black text-slate-800 text-center uppercase">
//                   {job.company?.substring(0, 4) || 'JOB'}
//                 </span>
//               )}
//             </div>
//             <div>
//               <h1 className="mb-3 text-[26px] leading-tight font-black tracking-tight text-slate-900">
//                 {job.title}
//               </h1>
//               <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px]">
//                 <span className="flex items-center gap-1.5 font-bold text-slate-700">
//                   <svg
//                     className="h-[18px] w-[18px] text-blue-500"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//                     />
//                   </svg>
//                   {job.company}
//                 </span>
//                 <span className="flex items-center gap-1.5 font-medium text-slate-500">
//                   <svg
//                     className="h-[18px] w-[18px] text-slate-400"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                   </svg>
//                   {locationString}
//                 </span>
//                 {job.salary && (
//                   <span className="flex items-center gap-1.5 font-medium text-slate-500">
//                     <svg
//                       className="h-[18px] w-[18px] text-slate-400"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                     {job.salary}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="flex shrink-0 gap-2.5">
//             <button
//               onClick={handleToggleSavedJob}
//               title={isSaved ? 'Unsave Job' : 'Save Job'}
//               className={`group flex h-11 w-11 items-center justify-center rounded-xl border transition-all shadow-sm ${
//                 isSaved
//                   ? 'border-red-200 bg-red-50 text-red-500 hover:border-red-300 hover:bg-red-100'
//                   : 'border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
//               }`}
//             >
//               <svg
//                 className={`h-[20px] w-[20px] ${isSaved ? 'fill-red-500' : 'group-hover:fill-red-500'}`}
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
//                 />
//               </svg>
//             </button>
//             <button
//               onClick={async () => {
//                 const shareData = {
//                   title: job.title,
//                   text: `Check out this job: ${job.title}`,
//                   url: `https://zobsai.com/jobs/${job.slug}`,
//                 };
//                 try {
//                   if (navigator.share) {
//                     await navigator.share(shareData);
//                   } else {
//                     await navigator.clipboard.writeText(shareData.url);
//                     toast({
//                       variant: 'default',
//                       title: 'Link copied to clipboard',
//                       description: 'Share it anywhere!',
//                     });
//                   }
//                 } catch (err) {
//                   console.error('Error sharing:', err);
//                 }
//               }}
//               title="Share Job"
//               className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
//             >
//               <svg
//                 className="h-[20px] w-[20px]"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Sticky Action Bar */}
//       <div className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-3 border-y border-slate-200 bg-white/90 px-8 py-4 shadow-sm backdrop-blur-xl">
//         {job.origin === 'EXTERNAL' &&
//         job.applyMethod?.url &&
//         job.applyMethod.url !== 'email' ? (
//           <button
//             onClick={handleApplyOnSite}
//             className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
//           >
//             <svg
//               className="h-4 w-4"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//               />
//             </svg>
//             Apply on Company Site
//           </button>
//         ) : isApplying ? (
//           <button
//             disabled
//             className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-[13.5px] font-bold text-white opacity-90"
//           >
//             <CheckCircle className="h-4 w-4" />
//             Applied
//           </button>
//         ) : (
//           <Link href={`/dashboard/jobs/${job._id}/apply`}>
//             <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700">
//               <svg
//                 className="h-4 w-4"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2.5"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//                 />
//               </svg>
//               Apply Now
//             </button>
//           </Link>
//         )}

//         <Link
//           href={`/dashboard/apply?slug=${encodeURIComponent(job._id ?? '')}&step=cv`}
//         >
//           <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13.5px] font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
//             <svg
//               className="h-4 w-4 text-blue-500"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
//               />
//             </svg>
//             Tailor My Docs
//           </button>
//         </Link>

//         {/* Scores Section */}
//         <div className="ml-auto flex items-center gap-3">
//           {/* ATS Score Logic */}
//           {!atsScore ? (
//             <button
//               onClick={handleGetATSScore}
//               disabled={isLoadingAtsScore}
//               className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2 transition-all hover:bg-slate-100 disabled:opacity-50"
//             >
//               {isLoadingAtsScore ? (
//                 <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
//               ) : (
//                 <svg
//                   className="h-4 w-4 text-indigo-500"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               )}
//               <span className="text-[12px] font-semibold text-slate-600">
//                 {isLoadingAtsScore
//                   ? 'Calculating ATS...'
//                   : 'Calculate ATS Score'}
//               </span>
//             </button>
//           ) : (
//             <div
//               className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2 cursor-pointer group hover:bg-slate-100"
//               onClick={handleGetATSScore}
//             >
//               <svg
//                 className="h-4 w-4 text-indigo-500"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2.5"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <span className="text-[12px] font-semibold text-slate-600">
//                 AI ATS Score:{' '}
//                 <span className="font-extrabold text-slate-900">
//                   {atsScore.atsScore}/100
//                 </span>
//               </span>
//             </div>
//           )}

//           {/* Match Score Logic */}
//           {!matchScore ? (
//             <button
//               onClick={handleGetMatchScore}
//               disabled={isLoadingScore}
//               className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2 transition-all hover:bg-slate-100 disabled:opacity-50"
//             >
//               {isLoadingScore ? (
//                 <Loader2 className="h-4 w-4 text-teal-500 animate-spin" />
//               ) : (
//                 <svg
//                   className="h-4 w-4 text-teal-500"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M13 10V3L4 14h7v7l9-11h-7z"
//                   />
//                 </svg>
//               )}
//               <span className="text-[12px] font-semibold text-slate-600">
//                 {isLoadingScore
//                   ? 'Calculating Match...'
//                   : 'Calculate Match Score'}
//               </span>
//             </button>
//           ) : (
//             <div
//               className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2 cursor-pointer group hover:bg-slate-100"
//               onClick={handleGetMatchScore}
//             >
//               <svg
//                 className="h-4 w-4 text-teal-500"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2.5"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M13 10V3L4 14h7v7l9-11h-7z"
//                 />
//               </svg>
//               <span className="text-[12px] font-semibold text-slate-600">
//                 Match Score:{' '}
//                 <span className="font-extrabold text-slate-900">
//                   {matchScore.matchScore}/10
//                 </span>
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Job Description Area */}
//       <div className="jd-prose p-8 pb-20 text-[14px] leading-relaxed text-slate-600 flex-1">
//         <h3 className="mb-5 flex items-center gap-2.5 text-[17px] font-extrabold text-slate-900">
//           <div className="h-5 w-1.5 rounded-full bg-blue-600"></div>
//           Job Description
//         </h3>

//         {job.description ? (
//           renderJobDescription(job.description)
//         ) : (
//           <p className="italic text-slate-500">No job description provided.</p>
//         )}

//         {/* Bottom CTA Card */}
//         <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-[#F8FAFC] p-6 shadow-sm sm:flex-row mb-6">
//           <div>
//             <p className="mb-1 text-[15px] font-extrabold text-slate-900">
//               Increase your chances of getting hired.
//             </p>
//             <p className="text-[13px] font-medium text-slate-500">
//               Use ZobsAI to tailor your resume specifically to this job
//               description.
//             </p>
//           </div>
//           <Link
//             href={`/dashboard/cv-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cv`}
//           >
//             <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-[13px] font-bold whitespace-nowrap text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-black">
//               <svg
//                 className="h-4 w-4"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2.5"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
//                 />
//               </svg>
//               Tailor My CV
//             </button>
//           </Link>
//         </div>
//       </div>

//       <MatchScoreModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         isLoading={isLoadingScore}
//         scoreData={matchScore}
//         error={scoreError}
//       />
//     </section>
//   );
// }

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { MatchScoreModal } from './MatchScoreModal';

import {
  savedStudentJobsRequest,
  visitedJobsRequest,
} from '@/redux/reducers/jobReducer';
import { useProfile } from '@/hooks/useProfile';

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
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileText,
  FileSignature,
  Target,
  Lightbulb,
  TargetIcon,
} from 'lucide-react';

import { JobListing } from '@/lib/data/jobs';
import { postStudentEventsRequest } from '@/redux/reducers/studentReducer';

import { getToken } from '@/hooks/useToken';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JobDetailClientProps {
  job: JobListing;
}

interface MatchScore {
  matchScore: number;
  skillsFitPercent?: number;
  experienceFitPercent?: number;
  seniorityFitPercent?: number;
  techFitPercent?: number;
  roleFitPercent?: number;
  breakdown?: { skills: string; experience: string; seniority: string };
  skillsMatched?: { skill: string }[];
  skillsMissing?: string[];
  suggestions?: string[];
  recommendation: string;
  improvedSummary?: string;
}

interface AtsScore {
  atsScore: number;
  suggestions: string;
  improvedResumeSummary: string;
}

export default function JobDetail({ job }: JobDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const { profile } = useProfile();

  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [isLoadingAtsScore, setIsLoadingAtsScore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'match' | 'ats'>('match');
  const [isApplying, setIsApplying] = useState(false);
  const [openCard, setOpenCard] = useState<'match' | 'ats' | null>('match');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [savedCvs, setSavedCvs] = useState<
    { _id: string; htmlCVTitle?: string }[]
  >([]);
  const [cvForMatch, setCvForMatch] = useState<string>('profile');

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
    if (!token) return;
    const fetchCvs = async () => {
      try {
        const res = await apiInstance.get('/students/resume/saved');
        const list = res.data?.html || res.data || [];
        setSavedCvs(Array.isArray(list) ? list : []);
      } catch {
        setSavedCvs([]);
      }
    };
    fetchCvs();
  }, [token]);

  useEffect(() => {
    if (!job?._id) return;

    const controller = new AbortController();
    const matchCacheKey =
      cvForMatch && cvForMatch !== 'profile'
        ? `matchScore_${job._id}_${cvForMatch}`
        : MATCH_SCORE_KEY(job._id);

    try {
      const rawMatch = localStorage.getItem(matchCacheKey);
      const parsedMatch = rawMatch ? JSON.parse(rawMatch) : null;

      if (parsedMatch && typeof parsedMatch.matchScore === 'number') {
        setMatchScore(parsedMatch);
      } else {
        setMatchScore(null);
        localStorage.removeItem(matchCacheKey);
      }
    } catch {
      setMatchScore(null);
      localStorage.removeItem(matchCacheKey);
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
  }, [job?._id, cvForMatch]);

  useEffect(() => {
    if (!job?._id) return;

    const controller = new AbortController();
    const { signal } = controller;

    const cacheKey =
      cvForMatch && cvForMatch !== 'profile'
        ? `matchScore_${job._id}_${cvForMatch}`
        : `matchScore_${job._id}`;
    const savedScore = localStorage.getItem(cacheKey);
    setMatchScore(savedScore ? (JSON.parse(savedScore) as MatchScore) : null);
    setIsLoadingScore(false);
    setProgress(0);

    const checkJobStatus = async () => {
      try {
        const savedRes = await apiInstance.get(
          '/students/jobs/intraction-status',
          { params: { jobId: job._id }, signal },
        );

        if (signal.aborted) return;
        setIsSaved(Boolean(savedRes?.data?.saved));
        setIsApplying(Boolean(savedRes?.data?.applied));
      } catch (error) {
        if (!signal.aborted) {
          console.error('Failed to check job status:', error);
        }
      }
    };

    checkJobStatus();
    return () => controller.abort();
  }, [job?._id, cvForMatch]);

  const handleToggleSavedJob = useCallback(async () => {
    try {
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
    interval = window.setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 1000);

    const payload: Record<string, string> = {
      jobDescription: job.description,
      jobTitle: job.title || '',
    };
    if (cvForMatch && cvForMatch !== 'profile') {
      payload.savedCVId = cvForMatch;
    }

    try {
      const response = await apiInstance.post(
        '/students/calculate-match',
        payload,
        { signal },
      );

      if (signal.aborted) return;
      setProgress(100);
      const data = response.data as MatchScore;
      setMatchScore(data);
      if (job._id) {
        const cacheKey =
          cvForMatch && cvForMatch !== 'profile'
            ? `matchScore_${job._id}_${cvForMatch}`
            : `matchScore_${job._id}`;
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }

      if (!response.success) {
        toast({
          title: 'Success',
          description: 'Successfully calculated the AI match score.',
        });
      }

      // Show match panel automatically upon calculation
      setActiveView('match');
      setOpenCard('match');

      if (response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please Upgrade your plan to use AI Match Score.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Could not calculate the AI score.',
        description: error.response?.data?.message || 'Something went wrong',
      });
      setProgress(0);
      setScoreError('Could not calculate the AI match score.');
    } finally {
      if (interval) window.clearInterval(interval);
      setIsLoadingScore(false);
    }
  }, [job?._id, job?.description, cvForMatch]);

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
      setAtsScore(response.data);
      if (job._id) {
        localStorage.setItem(
          `atsScore_${job._id}`,
          JSON.stringify(response.data),
        );
      }
      if (!response.success) {
        toast({
          title: 'Success',
          description: 'ATS score calculated successfully',
        });
      }

      // Show ATS panel automatically upon calculation
      setActiveView('ats');
      setOpenCard('ats');

      if (response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please Upgrade your plan to use AI Match Score.',
        });
      }
    } catch (error: any) {
      if (!signal.aborted) {
        toast({
          title: 'Could not calculate the AI score.',
          description: error.response?.data?.message || 'Something went wrong',
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

  const renderJobDescription = (text: string) => {
    const lines = text.split('\n');
    const isHtml = /<[a-z][\s\S]*>/i.test(text);
    if (isHtml) {
      return (
        <div
          className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={index} className="h-2" />;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        return (
          <div
            key={index}
            className="ml-4 flex items-start gap-2 text-sm text-slate-600 mb-2"
          >
            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
            <span>{trimmed.replace(/^[-•]/, '').trim()}</span>
          </div>
        );
      }
      return (
        <p key={index} className="text-sm text-slate-600 leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    });
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a job to see the details</p>
      </div>
    );
  }

  const locationString = (() => {
    const NOISE = [
      'anywhere',
      'remote',
      'worldwide',
      'global',
      'online',
      'virtual',
    ];
    const rawCity = job.location?.city?.trim() ?? '';
    const city = NOISE.includes(rawCity.toLowerCase()) ? '' : rawCity;
    const state = (job.location as any)?.state?.trim?.() ?? '';
    const country = (job.country as string | undefined)?.trim() ?? '';
    const parts: string[] = [];
    if (city) parts.push(city);
    if (state && state !== city) parts.push(state);
    if (country) parts.push(country);
    if (parts.length > 0) return parts.join(', ');
    if ((job as any).remote) return 'Remote';
    return 'Location not specified';
  })();

  const handleShare = async () => {
    const shareData = {
      title: job.title,
      text: `Check out this job: ${job.title}`,
      url: `https://zobsai.com/jobs/${job.slug}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          variant: 'default',
          title: 'Link copied to clipboard',
          description: 'Share it anywhere!',
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <section className="custom-scrollbar relative flex flex-1 flex-col overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-sm h-full animate-in fade-in duration-500">
      {/* Top Header Section */}
      <div className="shrink-0 bg-white px-8 pt-8 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-slate-200 bg-white p-2 shadow-sm overflow-hidden relative">
              {job.logo ? (
                <Image
                  src={job.logo}
                  alt={job.company || 'Company Logo'}
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-xs font-black text-slate-800 text-center uppercase tracking-widest">
                  {job.company?.substring(0, 4) || 'JOB'}
                </span>
              )}
            </div>
            <div>
              <h1 className="mb-3 text-[26px] leading-tight font-black tracking-tight text-slate-900">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px]">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Building2 className="h-[18px] w-[18px] text-blue-500" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <MapPin className="h-[18px] w-[18px] text-slate-400" />
                  {locationString}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <svg
                      className="h-[18px] w-[18px] text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {job.salary}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-medium text-slate-500 capitalize">
                  <Briefcase className="h-[18px] w-[18px] text-slate-400" />
                  {job?.jobTypes?.[0] || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <button
              onClick={handleToggleSavedJob}
              title={isSaved ? 'Unsave Job' : 'Save Job'}
              className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            >
              <Heart
                className={`h-[20px] w-[20px] ${isSaved ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-500'}`}
              />
            </button>
            <button
              onClick={handleShare}
              title="Share Job"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <Share2 className="h-[20px] w-[20px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-3 border-y border-slate-200 bg-white/90 px-8 py-4 shadow-sm backdrop-blur-xl">
        {token ? (
          <>
            {job.origin === 'EXTERNAL' &&
            job.applyMethod?.url &&
            job.applyMethod.url !== 'email' ? (
              <button
                onClick={handleApplyOnSite}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                Apply on Company Site
              </button>
            ) : isApplying ? (
              <button
                disabled
                className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-[13.5px] font-bold text-white opacity-90"
              >
                <CheckCircle className="h-4 w-4" />
                Applied
              </button>
            ) : (
              <Link href={`/dashboard/jobs/${job._id}/apply`}>
                <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Apply Now
                </button>
              </Link>
            )}

            <Link
              href={`/dashboard/apply?slug=${encodeURIComponent(job._id ?? '')}&step=cv`}
            >
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13.5px] font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                <svg
                  className="h-4 w-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                Tailor My Docs
              </button>
            </Link>

            {savedCvs.length > 0 && (
              <Select value={cvForMatch} onValueChange={setCvForMatch}>
                <SelectTrigger className="h-[42px] w-[190px] rounded-xl border border-slate-200 bg-white text-[13.5px] font-medium text-slate-700 focus:ring-0">
                  <SelectValue placeholder="Match against" />
                </SelectTrigger>
                <SelectContent className="bg-white text-sm">
                  <SelectItem value="profile">My Profile</SelectItem>
                  {savedCvs.map((cv) => (
                    <SelectItem key={cv._id} value={cv._id}>
                      {cv.htmlCVTitle || 'Untitled CV'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Scores Badges */}
            <div className="ml-auto flex items-center gap-3">
              {/* ATS Score */}
              {!atsScore ? (
                <button
                  onClick={handleGetATSScore}
                  disabled={isLoadingAtsScore}
                  className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2 transition-all hover:bg-slate-100 disabled:opacity-50"
                >
                  {isLoadingAtsScore ? (
                    <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 text-indigo-500" />
                  )}
                  <span className="text-[12px] font-semibold text-slate-600">
                    {isLoadingAtsScore ? `${progress}%` : 'Calculate ATS'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveView('ats');
                    setOpenCard('ats');
                  }}
                  className={`flex items-center gap-2 rounded-[10px] border px-3.5 py-2 transition-all ${activeView === 'ats' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <Zap className="h-4 w-4 text-indigo-500" />
                  <span className="text-[12px] font-semibold text-slate-600">
                    ATS Score:{' '}
                    <span className="font-extrabold text-slate-900">
                      {atsScore.atsScore}/100
                    </span>
                  </span>
                </button>
              )}

              {/* Match Score */}
              {!matchScore ? (
                <button
                  onClick={handleGetMatchScore}
                  disabled={isLoadingScore}
                  className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2 transition-all hover:bg-slate-100 disabled:opacity-50"
                >
                  {isLoadingScore ? (
                    <Loader2 className="h-4 w-4 text-teal-500 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4 text-teal-500" />
                  )}
                  <span className="text-[12px] font-semibold text-slate-600">
                    {isLoadingScore ? `${progress}%` : 'Calculate Match'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveView('match');
                    setOpenCard('match');
                  }}
                  className={`flex items-center gap-2 rounded-[10px] border px-3.5 py-2 transition-all ${activeView === 'match' ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <Star className="h-4 w-4 text-teal-500" />
                  <span className="text-[12px] font-semibold text-slate-600">
                    Match Score:{' '}
                    <span className="font-extrabold text-slate-900">
                      {matchScore.matchScore}/10
                    </span>
                  </span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="ml-auto">
            <Button
              onClick={() => router.push('/login')}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Sign up to Apply
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="jd-prose p-8 pb-20 text-[14px] leading-relaxed text-slate-600 flex-1">
        {/* Expanded ATS Score Details */}
        {activeView === 'ats' &&
          atsScore &&
          openCard === 'ats' &&
          !isLoadingAtsScore && (
            <div className="mb-8 overflow-hidden rounded-[24px] border border-indigo-100 bg-white shadow-sm">
              <div className="flex w-full items-center justify-between bg-indigo-50/50 px-6 py-5 border-b border-indigo-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-white font-black text-xl shadow-md">
                    {atsScore.atsScore}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-slate-900 m-0 leading-tight">
                      ATS Score Analysis
                    </h3>
                    <p className="text-[13px] font-medium text-slate-500 m-0 mt-1">
                      Scan complete. Out of 100.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenCard(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-indigo-100/50 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <h4 className="mb-3 text-[14.5px] font-extrabold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-500" /> ATS
                  Suggestions
                </h4>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                  <p className="text-[13.5px] text-slate-700 leading-relaxed m-0 whitespace-pre-wrap">
                    {atsScore.suggestions}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Expanded Match Score Details */}
        {activeView === 'match' &&
          matchScore &&
          openCard === 'match' &&
          !isLoadingScore && (
            <div className="mb-8 overflow-hidden rounded-[24px] border border-teal-100 bg-white shadow-sm">
              <div className="flex w-full items-center justify-between bg-teal-50/50 px-6 py-5 border-b border-teal-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-white font-black text-xl shadow-md">
                    {matchScore.matchScore}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-slate-900 m-0 leading-tight">
                      AI Match Analysis
                    </h3>
                    <p className="text-[13px] font-medium text-slate-500 m-0 mt-1">
                      Based on your selected profile/CV.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenCard(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-teal-100/50 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Recommendation */}
                <div>
                  <h4 className="mb-3 text-[14.5px] font-extrabold text-slate-900 flex items-center gap-2">
                    <TargetIcon className="w-4 h-4 text-teal-500" />{' '}
                    Recommendation
                  </h4>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                    <p className="text-[13.5px] text-slate-700 leading-relaxed m-0">
                      {matchScore.recommendation}
                    </p>
                  </div>
                </div>

                {/* Improved Summary */}
                {matchScore.improvedSummary && (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-[14.5px] font-extrabold text-slate-900 hover:text-teal-700 transition-colors">
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                      View Improved Resume Summary
                    </summary>
                    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-5">
                      <p className="text-[13.5px] text-slate-700 leading-relaxed m-0">
                        {matchScore.improvedSummary}
                      </p>
                    </div>
                  </details>
                )}

                {/* Generate Docs Section */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="mb-4 text-[14.5px] font-extrabold text-slate-900 flex items-center gap-2">
                    <FilePlus2 className="w-4 h-4 text-blue-600" /> Generate
                    Tailored Docs
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-5"
                    >
                      <Link
                        href={`/dashboard/cv-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cv`}
                      >
                        <FileText className="w-4 h-4 mr-2 text-blue-500" /> CV
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-5"
                    >
                      <Link
                        href={`/dashboard/cover-letter-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cl`}
                      >
                        <FileSignature className="w-4 h-4 mr-2 text-indigo-500" />{' '}
                        Cover Letter
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold px-5"
                    >
                      <Link
                        href={`/dashboard/apply?slug=${encodeURIComponent(job._id ?? '')}&step=cv`}
                      >
                        <FilePlus2 className="w-4 h-4 mr-2 text-white" /> Both
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        <h3 className="mb-5 flex items-center gap-2.5 text-[17px] font-extrabold text-slate-900">
          <div className="h-5 w-1.5 rounded-full bg-blue-600"></div>
          Job Description
        </h3>

        {/* Render Cleaned JD */}
        {job.description ? (
          <div className="mb-8 ">{renderJobDescription(job.description)}</div>
        ) : (
          <p className="italic text-slate-500 mb-8">
            No job description provided.
          </p>
        )}

        {/* Highlights Section */}
        {job.highlights && Object.keys(job.highlights).length > 0 && (
          <div className="mt-10 space-y-8">
            {Object.entries(job.highlights).map(([title, items], index) => (
              <div
                key={title}
                className="rounded-[24px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={`h-8 w-1.5 rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-teal-500'}`}
                  />
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {title}
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                  {(items as string[]).map((item, idx) => (
                    <div
                      key={`${title}-${idx}`}
                      className="group flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/50"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${index % 2 === 0 ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white' : 'bg-teal-100 text-teal-600 group-hover:bg-teal-500 group-hover:text-white'} transition-colors duration-300`}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <span className="flex-1 text-[13.5px] leading-relaxed text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 to-[#F8FAFC] p-6 sm:p-8 shadow-sm sm:flex-row">
          <div>
            <p className="mb-1 text-[16px] font-extrabold text-slate-900">
              Increase your chances of getting hired.
            </p>
            <p className="text-[13.5px] font-medium text-slate-500">
              Use ZobsAI to tailor your resume specifically to this job
              description.
            </p>
          </div>
          <Link
            href={`/dashboard/cv-generator?slug=${encodeURIComponent(job._id ?? '')}&step=cv&docType=cv`}
          >
            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-[14px] font-bold whitespace-nowrap text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-black">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              Tailor My CV
            </button>
          </Link>
        </div>
      </div>

      <MatchScoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoadingScore}
        scoreData={matchScore}
        error={scoreError}
      />
    </section>
  );
}
