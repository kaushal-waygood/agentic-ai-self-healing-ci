// 'use client';
// import ReactMarkdown from 'react-markdown';

// import React, { useState, useEffect } from 'react';
// import { JobListing } from '@/lib/data/jobs';
// import { Button } from '@/components/ui/button';
// import {
//   FilePlus2,
//   CheckCircle,
//   Heart,
//   ExternalLink,
//   Sparkles,
//   Loader2,
//   ChevronDown,
//   ChevronUp,
//   HeartOff, // ✅ LOGIC: Imported Loader for loading state
// } from 'lucide-react';
// import Link from 'next/link';
// import { useToast } from '@/hooks/use-toast';
// import apiInstance from '@/services/api';
// import { MatchScoreModal } from './MatchScoreModal';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';

// interface JobDetailClientProps {
//   job: JobListing;
// }

// interface MatchScore {
//   matchScore: number;
//   recommendation: string;
// }

// export default function JobDetail({ job }: JobDetailClientProps) {
//   // ✅ LOGIC: Unified state for the match score. This is now the single source of truth.
//   // const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
//   // const [isLoadingScore, setIsLoadingScore] = useState(false);
//   const { toast } = useToast();

//   const [matchScore, setMatchScore] = useState(null);
//   const [isLoadingScore, setIsLoadingScore] = useState(false);
//   const [progress, setProgress] = useState(0);
//   // ✅ FIX: Initialized state to a boolean for predictable behavior
//   const [isSaved, setIsSaved] = useState(false);
//   const [isApplying, setIsApplying] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [scoreError, setScoreError] = useState<string | null>(null);
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(true);

//   useEffect(() => {
//     if (!job?._id) return;

//     // Load match score from localStorage if exists
//     const savedScore = localStorage.getItem(`matchScore_${job._id}`);
//     if (savedScore) {
//       setMatchScore(JSON.parse(savedScore));
//     } else {
//       setMatchScore(null); // Reset if no saved score
//     }

//     setIsLoadingScore(false);
//     setProgress(0);

//     const checkJobStatus = async () => {
//       try {
//         const [savedRes, appliedRes] = await Promise.all([
//           apiInstance.get('students/jobs/issaved', {
//             params: { jobId: job._id },
//           }),
//           apiInstance.get('/students/job/isapplied', {
//             params: { jobId: job._id },
//           }),
//         ]);
//         setIsSaved(savedRes.data.isSaved);
//         setIsApplying(appliedRes.data.isApplied);
//       } catch (error) {
//         console.error('Failed to check job status:', error);
//       }
//     };

//     checkJobStatus();
//   }, [job]);

//   const handleToggleSavedJob = async () => {
//     try {
//       if (isSaved) {
//         // Unsave the job
//         await apiInstance.post('/students/jobs/saved', {
//           jobId: job._id,
//         });
//         setIsSaved(false);
//         toast({
//           title: 'Job Unsaved',
//           description: 'You have removed this job from your saved list.',
//         });
//       } else {
//         // Save the job
//         await apiInstance.post('students/jobs/saved', { jobId: job._id });
//         setIsSaved(true);
//         toast({
//           title: 'Job Saved!',
//           description: 'You have successfully saved this job.',
//         });
//       }
//     } catch (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Something went wrong. Please try again.',
//       });
//     }
//   };

//   const handleGetMatchScore = async () => {
//     setIsLoadingScore(true);
//     setMatchScore(null);
//     setScoreError(null);
//     setProgress(0);

//     const interval = setInterval(() => {
//       setProgress((prev) => (prev < 90 ? prev + 5 : prev));
//     }, 1000);

//     try {
//       const response = await apiInstance.post('/students/calculate-match', {
//         jobDescription: job.description,
//       });

//       clearInterval(interval);
//       setProgress(100);
//       setMatchScore(response.data);

//       // ✅ Save match score in localStorage
//       localStorage.setItem(
//         `matchScore_${job._id}`,
//         JSON.stringify(response.data),
//       );
//     } catch (error) {
//       clearInterval(interval);
//       setProgress(0);
//       console.error('Match score error:', error);
//       setScoreError('Could not calculate the AI match score.');
//     } finally {
//       setIsLoadingScore(false);
//     }
//   };

//   const handleApplyOnSite = async () => {
//     try {
//       await apiInstance.get(`/students/jobs/visited/${job._id}`);
//     } catch (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to apply for the job',
//       });
//     }
//   };

//   if (!job) {
//     return (
//       <div className="flex items-center justify-center h-full text-muted-foreground">
//         <p>Select a job to see the details</p>
//       </div>
//     );
//   }

//   const normalizeDescription = (desc: string) => {
//     return (
//       desc

//         // Any line that ends with ":" becomes a heading
//         .replace(/^(.*?):\s*$/gm, '### $1')
//         .replace(/•\s*/g, '- ') // convert • into markdown list items
//         .replace(/\n\s*\n/g, '\n\n')
//     ); // keep paragraph spacing
//   };

//   const formatted = normalizeDescription(job.description);

//   // --- UI BELOW IS UNCHANGED, ONLY LOGIC FOR RENDERING IS FIXED ---
//   return (
//     <div className="space-y-1">
//       <div className="bg-white rounded-2xl  border border-gray-200 overflow-hidden">
//         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 text-white flex items-center justify-between">
//           <div>
//             <h1 className="text-lg font-bold ">{job.title}</h1>
//             <div className="text-xs flex items-center gap-1 text-purple-100">
//               <span className="font-semibold">{job.company}</span>
//               <span>|</span>
//               <span>{job.country || 'Not speicfied'}</span>
//               <span>|</span>
//               <span className="capitalize">
//                 {job?.jobTypes[0] ? job.jobTypes[0] : 'Not specified'}
//               </span>
//             </div>
//           </div>
//           {/* job saved Unsave button  */}

//           <Button
//             onClick={handleToggleSavedJob}
//             className={`flex  items-center justify-center gap-2 w-15 h-10 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105  ${
//               isSaved
//                 ? 'bg-red-100 hover:bg-red-200 text-red-700 shadow-red-200'
//                 : 'bg-red-100 hover:bg-red-200 text-red-500 border border-red-300'
//             }`}
//           >
//             {isSaved ? (
//               <div className="flex items-center gap-1">
//                 <span> Unsave </span>
//                 <HeartOff
//                   className={`w-4 h-4 transition-transform duration-200  ${
//                     isSaved
//                       ? 'scale-110 text-red-500'
//                       : 'fill-current scale-100 text-red-400'
//                   }`}
//                 />
//               </div>
//             ) : (
//               <div className="flex items-center gap-1">
//                 <span> Save </span>
//                 <Heart
//                   className={`w-6 h-6 transition-transform duration-200 ${
//                     isSaved
//                       ? '  scale-110 text-red-500'
//                       : 'fill-current scale-100  text-red-400'
//                   }`}
//                 />
//               </div>
//             )}
//           </Button>
//         </div>

//         <div className="p-2 flex flex-col md:flex-row justify-between items-start  md:items-center gap-3">
//           <div>
//             {/* Company Logo or Fallback Icon */}
//             {job.logo ? (
//               <img
//                 src={job.logo}
//                 alt={job.company || 'Company Logo'}
//                 className="w-12 h-12 object-contain rounded"
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
//                 <Image width={32} height={32} src="/logo.png" alt="abc" />
//               </div>
//             )}
//           </div>

//           <div className="flex flex-col justify-end md:flex-row gap-2 flex-1">
//             {/* Tailor & Apply / Tailor My Docs Button */}
//             {job.applyMethod?.url === 'email' ? (
//               <Button
//                 asChild
//                 className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold w-full md:w-auto transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 <Link
//                   href={`/dashboard/apply?slug=${encodeURIComponent(
//                     job._id,
//                   )}&step=cv`}
//                 >
//                   <FilePlus2 className="w-4 h-4" /> Tailor & Apply
//                 </Link>
//               </Button>
//             ) : (
//               <Button
//                 asChild
//                 className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl font-semibold w-full md:w-auto transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 <Link
//                   href={`/dashboard/apply?slug=${encodeURIComponent(
//                     job._id,
//                   )}&step=cv`}
//                 >
//                   <FilePlus2 className="w-4 h-4" /> Tailor My Docs
//                 </Link>
//               </Button>
//             )}

//             {/* Company Site Button */}
//             {job.applyMethod?.url && (
//               <Link
//                 href={`${job.applyMethod.url}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 onClick={handleApplyOnSite}
//                 className="flex items-center justify-center gap-2 bg-gradient-to-r  from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl font-semibold w-full md:w-auto text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 <ExternalLink className="w-4 h-4" /> Company Site
//               </Link>
//             )}

//             {/* Job Matching Score Button */}
//             {!matchScore && !isLoadingScore && (
//               <Button
//                 onClick={handleGetMatchScore}
//                 className=" w-full md:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 Job Matching Score
//               </Button>
//             )}

//             {/* Loading State */}
//             {isLoadingScore && (
//               <Button className="flex items-center justify-center gap-2 text-sm w-full md:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg cursor-not-allowed">
//                 <span className="animate-pulse">
//                   Calculating... {progress}%
//                 </span>
//                 <Loader2 className="w-4 h-4 text-white animate-spin" />
//               </Button>
//             )}

//             {/* Match Score Display */}
//             {matchScore && !isLoadingScore && (
//               <div className="text-sm w-full md:w-auto text-center bg-gradient-to-r from-yellow-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg">
//                 Match Score: {matchScore.matchScore}/10
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       {matchScore && !isLoadingScore && (
//         <div className="flex flex-col p-2 rounded-lg bg-purple-50 border border-purple-200">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="flex items-center justify-between gap-2 font-semibold text-purple-800 w-full"
//           >
//             <div className="flex items-center gap-2">
//               <Sparkles className="w-4 h-4" />
//               Match Score: {matchScore.matchScore}/10 | AI Recommendation
//             </div>
//             {isOpen ? (
//               <ChevronUp className="w-4 h-4 text-purple-700" />
//             ) : (
//               <ChevronDown className="w-4 h-4 text-purple-700" />
//             )}
//           </button>

//           {/* Dropdown content */}
//           {isOpen && (
//             <div className="mt-2 pl-6">
//               <p className="text-sm text-gray-600">
//                 {matchScore.recommendation}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3">
//         <h2 className="text-lg  text-gray-900 mb-1 flex items-center gap-2">
//           <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
//           Job Description
//         </h2>
//         <div className="text-xs prose prose-gray max-w-none text-gray-600 leading-relaxed">
//           {/* <div dangerouslySetInnerHTML={{ __html: job.description }}></div> */}
//           <ReactMarkdown
//             components={{
//               // Headings (h3)
//               h3: ({ node, ...props }) => (
//                 <h3 className="text-sm  text-gray-900 mt-2 " {...props} />
//               ),

//               // Lists
//               ul: ({ node, ...props }) => (
//                 <ul className="list-disc pl-6 space-y-1" {...props} />
//               ),
//               li: ({ node, ...props }) => (
//                 <li className="leading-snug" {...props} />
//               ),

//               // Paragraphs
//               p: ({ node, ...props }) => <p className="mb-3" {...props} />,
//             }}
//           >
//             {formatted}
//           </ReactMarkdown>
//         </div>
//       </div>
//       <MatchScoreModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         isLoading={isLoadingScore}
//         scoreData={matchScore}
//         error={scoreError}
//       />
//       {job.highlights &&
//         Object.entries(job.highlights).map(
//           ([title, items]: [string, string[]]) => (
//             <div
//               key={title}
//               className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
//             >
//               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                 <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
//                 {title}
//               </h3>
//               <ul className="space-y-3">
//                 {items.map((item, index) => (
//                   <li key={index} className="flex items-start gap-3">
//                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                     <span className="text-gray-600">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ),
//         )}
//     </div>
//   );
// }

'use client';
import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { JobListing } from '@/lib/data/jobs';
import { Button } from '@/components/ui/button';
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
  Clock,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { MatchScoreModal } from './MatchScoreModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface JobDetailClientProps {
  job: JobListing;
}

interface MatchScore {
  matchScore: number;
  recommendation: string;
}

export default function JobDetail({ job }: JobDetailClientProps) {
  const { toast } = useToast();
  const [matchScore, setMatchScore] = useState(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!job?._id) return;

    const savedScore = localStorage.getItem(`matchScore_${job._id}`);
    if (savedScore) {
      setMatchScore(JSON.parse(savedScore));
    } else {
      setMatchScore(null);
    }

    setIsLoadingScore(false);
    setProgress(0);

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

  const handleToggleSavedJob = async () => {
    try {
      if (isSaved) {
        await apiInstance.post('/students/jobs/saved', {
          jobId: job._id,
        });
        setIsSaved(false);
        toast({
          title: 'Job Unsaved',
          description: 'You have removed this job from your saved list.',
        });
      } else {
        await apiInstance.post('students/jobs/saved', { jobId: job._id });
        setIsSaved(true);
        toast({
          title: 'Job Saved!',
          description: 'You have successfully saved this job.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleGetMatchScore = async () => {
    setIsLoadingScore(true);
    setMatchScore(null);
    setScoreError(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 1000);

    try {
      const response = await apiInstance.post('/students/calculate-match', {
        jobDescription: job.description,
      });

      clearInterval(interval);
      setProgress(100);
      setMatchScore(response.data);

      localStorage.setItem(
        `matchScore_${job._id}`,
        JSON.stringify(response.data),
      );
    } catch (error) {
      clearInterval(interval);
      setProgress(0);
      console.error('Match score error:', error);
      setScoreError('Could not calculate the AI match score.');
    } finally {
      setIsLoadingScore(false);
    }
  };

  const handleApplyOnSite = async () => {
    try {
      await apiInstance.get(`/students/jobs/visited/${job._id}`);
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

  const normalizeDescription = (desc: string) => {
    return desc
      .replace(/^(.*?):\s*$/gm, '### $1')
      .replace(/•\s*/g, '- ')
      .replace(/\n\s*\n/g, '\n\n');
  };

  const formatted = normalizeDescription(job.description);

  return (
    <div className="min-h-screen  space-y-2">
      {/* Enhanced Header Card with Glassmorphism */}
      <div className="relative overflow-hidden rounded-xl  border border-white/20 ">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative p-2 md:p-4 text-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left: Job Info */}
            <div className="flex-1 space-y-4">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Actively Hiring
              </div> */}

              <div>
                <h1 className="text-xl md:text-2xl font-bold mb-3 leading-tight">
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
                      {job?.jobTypes[0] || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Save Button - Enhanced */}
            <Button
              onClick={handleToggleSavedJob}
              className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
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

      {/* Enhanced Action Buttons Card */}
      <div className=" rounded-xl  border border-white/20 p-1">
        <div className="flex flex-col md:flex-row items-stretch gap-4  px-6 ">
          {/* Enhanced Company Logo */}
          <div className="flex items-center justify-center md:justify-start">
            {job.logo ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-4 ring-purple-100/50">
                <img
                  src={job.logo}
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 shadow-lg ring-4 ring-purple-100/50">
                <img
                  src={'/logo.png'}
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons Grid */}
          <div className="flex flex-col justify-end md:flex-row gap-2 items-center flex-1 md:gap-4  ">
            {/* Tailor & Apply Button */}
            {job.applyMethod?.url === 'email' ? (
              <Button
                asChild
                className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
              >
                <Link
                  href={`/dashboard/apply?slug=${encodeURIComponent(
                    job._id,
                  )}&step=cv`}
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <FilePlus2 className="w-5 h-5" />
                    <span>Tailor & Apply</span>
                  </div>
                </Link>
              </Button>
            ) : (
              <Button
                href={`/dashboard/apply?slug=${encodeURIComponent(
                  job._id,
                )}&step=cv`}
                className="group relative overflow-hidden px-3 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center"
              >
                <div className=" absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <FilePlus2 className="w-5 h-5" />
                  <span>Tailor My Docs</span>
                </div>
              </Button>
            )}

            {/* Company Site Button */}
            {job.applyMethod?.url && (
              <Button
                href={`${job.applyMethod.url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApplyOnSite}
                className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  <span>Company Site</span>
                </div>
              </Button>
            )}

            {/* Match Score Button/Display - Enhanced */}
            {!matchScore && !isLoadingScore && (
              <Button
                href="#"
                onClick={handleGetMatchScore}
                className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
              >
                <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>AI Match Score</span>
                </div>
              </Button>
            )}

            {isLoadingScore && (
              <div className="relative overflow-hidden px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-blue-400/50 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold">{progress}%</span>
                </div>
              </div>
            )}

            {matchScore && !isLoadingScore && (
              <div className="relative overflow-hidden px-6 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold text-lg">
                    {matchScore.matchScore}/10
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced AI Recommendation Card */}
      {matchScore && !isLoadingScore && (
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl  border border-purple-200/50 overflow-hidden animate-in slide-in-from-top duration-500">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-3 flex items-center justify-between gap-3 hover:bg-white/50 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl  shadow-purple-500/30">
                <Star className="w-5 h-5 text-white " />
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
            <div className="p-2 hover:bg-white rounded-xl transition-colors">
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

      {/* Enhanced Job Description Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-purple-600 via-blue-600 to-cyan-600 rounded-full shadow-lg"></div>
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Job Description
          </h2>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          <ReactMarkdown
            components={{
              h3: ({ node, ...props }) => (
                <h3
                  className="text-sm font-bold text-gray-900 mt-6 mb-2 flex items-center gap-2"
                  {...props}
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  {props.children}
                </h3>
              ),
              ul: ({ node, ...props }) => (
                <ul className="space-y-2 ml-2 " {...props} />
              ),
              li: ({ node, ...props }) => (
                <li
                  className="flex items-start gap-3 leading-relaxed"
                  {...props}
                >
                  <div className="mt-2 w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0"></div>
                  <span className="flex-1">{props.children}</span>
                </li>
              ),
              p: ({ node, ...props }) => (
                <p className=" text-gray-700 text-sm" {...props} />
              ),
            }}
          >
            {formatted}
          </ReactMarkdown>
        </div>
      </div>

      {/* Enhanced Highlights Cards */}
      {job.highlights &&
        Object.entries(job.highlights).map(
          ([title, items]: [string, string[]], index) => (
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
                ></div>
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {title}
                </h3>
              </div>

              <div className="grid gap-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-transparent hover:from-purple-50 hover:via-blue-50 hover:to-cyan-50 transition-all duration-300 border border-transparent hover:border-purple-200 hover:shadow-md"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
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
          ),
        )}

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
