// import React, { useState, useRef, useEffect } from 'react';
// import {
//   User,
//   UploadCloud,
//   ArrowLeft,
//   CheckCircle2,
//   FileText,
//   Clock,
//   ChevronDown,
//   Briefcase,
// } from 'lucide-react';
// import apiInstance from '@/services/api';
// import { useSearchParams } from 'next/navigation';
// import { Loader } from '@/components/Loader';

// const SleekCvStep = ({
//   mockUserProfile,
//   handleCvContextSubmit,
//   setWizardStep,
//   selectedCvId,
//   setSelectedCvId,
//   isLoading,
//   handleCVContext,
// }: any) => {
//   const cvFileInputRef = useRef(null);
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);

//   const [stats, setStats] = useState({ cvsCount: 0 });
//   const [loading, setLoading] = useState(true);

//   const [cvs, setCvs] = useState([]);
//   const searchParams = useSearchParams();
//   const jobId = searchParams.get('slug');
//   const rawMode = searchParams.get('mode');
//   const mode = rawMode && rawMode !== 'undefined' ? rawMode : null;

//   const [jobDetail, setJobDetail] = useState<any>(null);
//   const [jobLoading, setJobLoading] = useState(false);

//   useEffect(() => {
//     if (!jobId) return;

//     const fetchJobDetail = async () => {
//       try {
//         setJobLoading(true);
//         const response = await apiInstance.get(`/jobs/job-desc/${jobId}`);
//         setJobDetail(response.data.singleJob);
//       } catch (error) {
//         console.error('Failed to fetch job detail:', error);
//       } finally {
//         setJobLoading(false);
//       }
//     };

//     fetchJobDetail();
//   }, [jobId]);

//   useEffect(() => {
//     const fetchCvs = async () => {
//       try {
//         setLoading(true);
//         const response = await apiInstance.get('/students/resume/saved');
//         setCvs(response.data.html || []);
//         setStats((prev) => ({
//           ...prev,
//           cvsCount: response.data.html?.length || 0,
//         }));
//       } catch (error) {
//         console.error('Failed to fetch CVs:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCvs();
//   }, []);

//   const getJobTitle = () => {
//     if (jobId && jobDetail?.title) return jobDetail.title;
//     if (mode === 'paste') return 'Pasted Job Description';
//     if (mode === 'upload') return 'Uploaded Job Description';
//     return 'Job Description';
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

//   return (
//     <div className=" bg-gradient-to-br from-slate-50 to-slate-100 p-6">
//       <div className="max-w-4xl mx-auto">
//         <div className=" bg-white border border-slate-200 rounded-md card-entrance">
//           {/* Header */}
//           <div className="p-8 pb-0">
//             <div className="flex items-center justify-center ">
//               <div className="flex space-x-2">
//                 <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
//                 <div className="w-8 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                 <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
//                 2
//               </div>
//               <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//                 Provide Your CV
//               </h2>
//             </div>
//             <p className="text-slate-600 ml-11">
//               The AI needs your background to tailor it for the job.
//             </p>
//           </div>

//           {/* Content */}
//           <div className="p-4 space-y-6">
//             {/* Saved CVs Section */}
//             <div className="card-entrance staggered-1">
//               {/* Job Info Dropdown */}

//               {/* Job You Are Applying For */}
//               <div className="card-entrance staggered-1 mb-4">
//                 <div className="flex items-center gap-2 text-sm font-medium mb-2">
//                   <Briefcase className="w-5 h-5 text-blue-500" />
//                   <span className="text-slate-700">
//                     Job You Are Applying For
//                   </span>
//                 </div>
//                 <div className="border border-slate-200 rounded-lg bg-slate-50/50">
//                   {jobLoading ? (
//                     <div className="flex items-center justify-center py-6 text-slate-500">
//                       Loading job details...
//                     </div>
//                   ) : jobId ? (
//                     jobDetail ? (
//                       <details className="group">
//                         {/* Header */}
//                         <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 rounded-lg hover:bg-slate-100 transition">
//                           <div className="font-semibold text-slate-800">
//                             {getJobTitle()}
//                           </div>
//                           <ChevronDown className="w-5 h-5 text-slate-500 transition-transform group-open:rotate-180" />
//                         </summary>

//                         {/* Description */}
//                         <div className="px-1 pb-4">
//                           <div className="max-h-[280px] overflow-y-auto text-sm text-slate-600 whitespace-pre-line pr-2 border-l-2 border-blue-500 pl-3">
//                             {/* {jobDetail.description} */}
//                             {renderJobDescription(jobDetail.description)}
//                           </div>
//                         </div>
//                       </details>
//                     ) : (
//                       <p className="text-sm text-red-500 p-4">
//                         Failed to load job data
//                       </p>
//                     )
//                   ) : (
//                     // ✅ Paste / Upload fallback UI
//                     <div className="px-4 py-3 text-sm text-slate-600">
//                       <div className="font-semibold text-slate-800 mb-1">
//                         {getJobTitle()}
//                       </div>
//                       <p>
//                         This job context was provided manually and does not have
//                         a saved job record.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex flex-row flex-wrap justify-between text-sm  font-medium mb-2">
//                 <label className="flex items-center">
//                   <FileText className="w-5 h-5 mr-2 text-blue-500" />
//                   Select From Saved CVs
//                 </label>
//                 <p>Total CVs: {stats.cvsCount}</p>
//                 {/* render CV list */}
//               </div>
//             </div>

//             <div className="max-h-[35vh] overflow-y-auto border border-slate-200 rounded-lg bg-slate-50/50">
//               {loading ? (
//                 <div className="flex flex-col items-center justify-center py-10 text-slate-500">
//                   {/* <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500" /> */}
//                   <div>
//                     <img
//                       src="/logo.png"
//                       alt=""
//                       className="w-10 h-10 animate-bounce"
//                     />
//                   </div>

//                   <p>Fetching saved CVs...</p>
//                 </div>
//               ) : (
//                 <div>
//                   {cvs?.length > 0 ? (
//                     <div className="p-2 space-y-2">
//                       {cvs.map((cv: any, index) => (
//                         <label
//                           key={cv._id}
//                           className="radio-card flex items-center gap-4 p-4 rounded-lg cursor-pointer border-2 transition-all duration-200   border-transparent hover:border-slate-300"
//                           style={{ animationDelay: `${index * 0.1}s` }}
//                         >
//                           <input
//                             type="radio"
//                             name="cvSelection"
//                             onClick={(e) => {
//                               handleCvContextSubmit('saved', cv._id);
//                             }}
//                             className="sr-only"
//                           />

//                           {/* Info */}
//                           <div className="flex-1">
//                             <div className="font-medium text-slate-800">
//                               {cv.htmlCVTitle || 'N/A'}
//                             </div>
//                             <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
//                               <Clock className="w-3 h-3" />
//                               {/* {cv.status} •{' '} */}
//                               {new Date(cv.createdAt).toLocaleString()}
//                             </div>
//                           </div>

//                           <FileText className="w-5 h-5 transition-colors text-purple-500" />
//                         </label>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-slate-500 text-center p-8">
//                       No saved CVs available.
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Divider */}
//             <div className="relative card-entrance staggered-2">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-slate-300"></div>
//               </div>
//               <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider">
//                 <span className="bg-white px-4 text-slate-500">
//                   Or Choose Alternative
//                 </span>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="grid grid-cols-2 md:grid-cols-2 gap-4 card-entrance staggered-3">
//               <button
//                 className="hover:border-blue-500 border p-4 flex flex-col items-center justify-center gap-3 rounded-xl text-slate-700 hover:text-blue-700 transition-all duration-300"
//                 onClick={() => handleCvContextSubmit('profile')}
//                 disabled={isLoading}
//               >
//                 <User className="w-8 h-8 text-blue-500" />
//                 <div className="text-center">
//                   <div className="font-semibold">Use My Profile</div>
//                   <div className="text-xs text-slate-500 mt-1">Quick setup</div>
//                 </div>
//               </button>

//               <button
//                 className="hover:border-blue-500 border p-4 flex flex-col items-center justify-center gap-3 rounded-xl text-slate-700 hover:text-blue-700 transition-all duration-300"
//                 onClick={() => cvFileInputRef.current?.click()}
//                 disabled={isLoading}
//               >
//                 <UploadCloud className="w-8 h-8 text-blue-500" />
//                 <div className="text-center">
//                   <div className="font-semibold">Upload CV File</div>
//                   <div className="text-xs text-slate-500 mt-1">
//                     PDF, DOC, DOCX
//                   </div>
//                 </div>
//                 {uploadedFile && (
//                   <div className="absolute top-2 right-2">
//                     <CheckCircle2 className="w-5 h-5 text-green-500" />
//                   </div>
//                 )}
//               </button>

//               <input
//                 type="file"
//                 ref={cvFileInputRef}
//                 onChange={(e) => {
//                   const file = e.target.files?.[0];
//                   if (file) {
//                     setUploadedFile(file);
//                     handleCVContext(e);
//                   }
//                 }}
//                 className="hidden"
//                 accept=".pdf,.doc,.docx"
//               />
//             </div>

//             {uploadedFile && (
//               <div className="card-entrance bg-green-50 border border-green-200 rounded-lg p-4">
//                 <div className="flex items-center gap-3">
//                   <CheckCircle2 className="w-5 h-5 text-green-600" />
//                   <div>
//                     <div className="font-medium text-green-800">
//                       File ready to be processed!
//                     </div>
//                     <div className="text-sm text-green-600">
//                       {uploadedFile.name}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             {/* Footer */}
//           </div>
//           <div className="px-8 pb-8 pt-0">
//             <button
//               className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
//               onClick={() => setWizardStep('job')}
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to Job Details
//             </button>
//           </div>
//         </div>
//       </div>
//       <style jsx>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .card-entrance {
//           animation: fadeInUp 0.6s ease-out;
//         }
//         .staggered-1 {
//           animation-delay: 0.1s;
//         }
//         .staggered-2 {
//           animation-delay: 0.2s;
//         }
//         .staggered-3 {
//           animation-delay: 0.3s;
//         }
//         .hover-lift {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }
//         .hover-lift:hover {
//           transform: translateY(-8px);
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
//         }
//         .gradient-border {
//           position: relative;
//           background: linear-gradient(145deg, #ffffff, #f8fafc);
//           border-radius: 1rem;
//         }
//         .gradient-border::before {
//           content: '';
//           position: absolute;
//           inset: 0;
//           padding: 2px;
//           background: linear-gradient(145deg, #9333ea, #3b82f6, #06b6d4);
//           border-radius: inherit;
//           mask:
//             linear-gradient(#fff 0 0) content-box,
//             linear-gradient(#fff 0 0);
//           -webkit-mask-composite: xor;
//           mask-composite: xor;
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }
//         .gradient-border:hover::before {
//           opacity: 1;
//         }
//         .btn-primary {
//           background: linear-gradient(135deg, #9333ea, #3b82f6);
//           box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
//           transition: all 0.3s ease;
//         }
//         .btn-primary:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4);
//         }
//         .btn-outline {
//           border: 2px solid #e2e8f0;
//           transition: all 0.3s ease;
//           position: relative;
//           overflow: hidden;
//         }
//         .btn-outline:hover {
//           border-color: #9333ea;
//           background: linear-gradient(
//             135deg,
//             rgba(147, 51, 234, 0.05),
//             rgba(59, 130, 246, 0.05)
//           );
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(147, 51, 234, 0.15);
//         }
//         .radio-card {
//           transition: all 0.3s ease;
//           position: relative;
//         }
//         .radio-card:hover {
//           background: linear-gradient(135deg, #fafafa, #f1f5f9);
//           transform: translateX(4px);
//         }
//         .radio-card.selected {
//           background: linear-gradient(
//             135deg,
//             rgba(147, 51, 234, 0.1),
//             rgba(59, 130, 246, 0.1)
//           );
//           border-color: #9333ea;
//         }
//       `}</style>
//     </div>
//   );
// };
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  UploadCloud,
  CheckCircle2,
  FileText,
  Clock,
  Briefcase,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react';
import apiInstance from '@/services/api';
import { useSearchParams } from 'next/navigation';
import { Loader } from '@/components/Loader';

const SleekCvStep = ({
  mockUserProfile,
  handleCvContextSubmit,
  setWizardStep,
  selectedCvId,
  setSelectedCvId,
  isLoading,
  handleCVContext,
}: any) => {
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [stats, setStats] = useState({ cvsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const [cvs, setCvs] = useState([]);
  const searchParams = useSearchParams();
  const jobId = searchParams.get('slug');
  const rawMode = searchParams.get('mode');
  const mode = rawMode && rawMode !== 'undefined' ? rawMode : null;

  const [jobDetail, setJobDetail] = useState<any>(null);
  const [jobLoading, setJobLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetail = async () => {
      try {
        setJobLoading(true);
        const response = await apiInstance.get(`/jobs/job-desc/${jobId}`);
        setJobDetail(response.data.singleJob);
      } catch (error) {
        console.error('Failed to fetch job detail:', error);
      } finally {
        setJobLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  useEffect(() => {
    const fetchCvs = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get('/students/resume/saved');
        setCvs(response.data.html || []);
        setStats((prev) => ({
          ...prev,
          cvsCount: response.data.html?.length || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch CVs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCvs();
  }, []);

  const getJobTitle = () => {
    if (jobId && jobDetail?.title) return jobDetail.title;
    if (mode === 'paste') return 'Pasted Job Description';
    if (mode === 'upload') return 'Uploaded Job Description';
    return 'Job Context Provided';
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
      if (!trimmed) return <div key={index} className="h-2" />;
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        return (
          <div
            key={index}
            className="ml-4 flex items-start gap-2 text-[13px] text-slate-600"
          >
            <span className="mt-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
            <span>{trimmed.replace(/^[-•]/, '').trim()}</span>
          </div>
        );
      }
      return (
        <p key={index} className="text-[13px] text-slate-600 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  // Drag and drop handlers
  const handleDrag = (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      handleCVContext({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-6 font-jakarta antialiased">
      {/* <div className="mx-auto flex h-full w-full max-w-[850px] flex-col"> */}
      <div className="mx-auto flex h-full w-full max-w-[1250px] flex-col">
        {/* HEADER & STEPPER */}
        <div className="mb-6 shrink-0">
          <div className="mb-6 text-center">
            <h1 className="text-[22px] font-black uppercase tracking-tight text-slate-900 md:text-[26px]">
              Tailored Application
            </h1>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">
              Simplify your job application process with our intuitive
              step-by-step wizard.
            </p>
          </div>

          <div className="mx-auto flex max-w-[400px] items-center justify-center relative">
            <div className="absolute left-8 right-8 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-slate-200"></div>
            {/* Step 2 Progress Line (50%) */}
            <div className="absolute left-8 top-1/2 z-0 h-0.5 w-[50%] -translate-y-1/2 bg-emerald-500 transition-all duration-500"></div>

            <div className="relative z-10 flex w-full justify-between">
              {/* Step 1: Completed */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Job Context
                </span>
              </div>
              {/* Step 2: Active */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  2
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">
                  CV Setup
                </span>
              </div>
              {/* Step 3: Pending */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  3
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Cover Letter
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN WIZARD CARD */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm animate-in fade-in duration-500">
          {/* Card Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-sm">
              <FileText className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-slate-900">
                Step 2: Provide Your CV
              </h2>
              <p className="text-[12px] font-medium text-slate-500">
                The AI needs your background to tailor the application for the
                job.
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
            {/* Job Context Preview */}
            <div className="shrink-0">
              <div className="mb-2 flex items-center gap-2">
                <Briefcase
                  className="h-4 w-4 text-teal-600"
                  strokeWidth={2.5}
                />
                <span className="text-[13px] font-extrabold text-slate-900">
                  Job You Are Applying For
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50">
                {jobLoading ? (
                  <div className="flex items-center justify-center py-6 text-[13px] font-medium text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                    details...
                  </div>
                ) : jobId ? (
                  jobDetail ? (
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors">
                        <div className="text-[14px] font-bold text-slate-800">
                          {getJobTitle()}
                        </div>
                        <ChevronDown className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="px-1 pb-4">
                        <div className="custom-scrollbar max-h-[280px] overflow-y-auto whitespace-pre-line border-l-2 border-teal-400 pl-4 pr-2 text-sm">
                          {renderJobDescription(jobDetail.description)}
                        </div>
                      </div>
                    </details>
                  ) : (
                    <p className="p-4 text-[13px] font-medium text-red-500">
                      Failed to load job data
                    </p>
                  )
                ) : (
                  <div className="px-4 py-3 text-[13px] text-slate-600">
                    <div className="mb-1 font-bold text-slate-800">
                      {getJobTitle()}
                    </div>
                    <p className="font-medium text-slate-500">
                      This context was provided manually.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Header for Saved CVs */}
            <div className="flex shrink-0 items-center justify-between px-1 mt-2">
              <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                <FileText className="h-4 w-4 text-teal-600" strokeWidth={2.5} />
                Select From Saved CVs
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Total: {stats.cvsCount}
              </span>
            </div>

            {/* List of Saved CVs */}
            <div className="shrink-0 space-y-3">
              {loading ? (
                <div className="py-8">
                  <Loader
                    message="Fetching saved CVs..."
                    imageClassName="w-6 h-6"
                    textClassName="text-sm text-slate-500"
                  />
                </div>
              ) : cvs?.length > 0 ? (
                <div className="custom-scrollbar max-h-[35vh] overflow-y-auto pr-2 space-y-3">
                  {cvs.map((cv: any) => (
                    <label
                      key={cv._id}
                      className="group relative block cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="cv_select"
                        className="peer sr-only"
                        checked={selectedCvId === cv._id}
                        onChange={() => setSelectedCvId(cv._id)}
                      />
                      <div className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-teal-600 peer-checked:border-teal-600 peer-checked:bg-teal-50/30">
                        <div className="flex items-center gap-3">
                          {/* Radio Ring */}
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 peer-checked:border-teal-600">
                            <div className="h-2.5 w-2.5 scale-0 rounded-full bg-teal-600 transition-transform peer-checked:scale-100"></div>
                          </div>
                          {/* Details */}
                          <div>
                            <div className="text-[14px] font-bold leading-tight text-slate-900">
                              {cv.htmlCVTitle || 'Untitled CV'}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                cv.updatedAt || cv.createdAt,
                              ).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-[13px] font-medium text-slate-500">
                    No saved CVs available. Please use an alternative method
                    below.
                  </p>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="flex shrink-0 items-center gap-4 py-2 mt-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Or Choose Alternative
              </span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* Alternative Options Grid */}
            <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Use Profile Button */}
              <button
                onClick={() => handleCvContextSubmit('profile')}
                disabled={isLoading}
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-4 text-left transition-all hover:bg-emerald-50/50 hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <User className="h-6 w-6" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[14px] font-bold leading-tight text-slate-900">
                    Use My Profile
                  </div>
                  <div className="mt-0.5 text-[11.5px] font-medium text-slate-500">
                    Base it on your saved profile.
                  </div>
                </div>
              </button>

              {/* Upload CV Button (with Drag & Drop) */}
              <button
                onClick={() => cvFileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                disabled={isLoading}
                className={`relative flex items-center gap-3 rounded-xl border-2 border-dashed p-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:bg-blue-50/50 hover:border-blue-400'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2} />
                  ) : (
                    <UploadCloud className="h-6 w-6" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-bold leading-tight text-slate-900">
                    {isLoading
                      ? 'Uploading...'
                      : dragActive
                        ? 'Drop file here!'
                        : 'Upload CV File'}
                  </div>
                  <div className="mt-0.5 text-[11.5px] font-medium text-slate-500">
                    PDF, DOC, DOCX, PNG, JPG
                  </div>
                </div>

                {uploadedFile && !isLoading && (
                  <div className="absolute right-3 top-3">
                    <CheckCircle2
                      className="h-5 w-5 text-green-500"
                      strokeWidth={2.5}
                    />
                  </div>
                )}
              </button>
              {/* Hidden file input */}
              <input
                type="file"
                ref={cvFileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile(file);
                    handleCVContext(e);
                  }
                }}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                disabled={isLoading}
              />
            </div>

            {/* Show success message when file is uploaded */}
            {uploadedFile && !isLoading && (
              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2
                  className="h-5 w-5 text-green-600"
                  strokeWidth={2.5}
                />
                <div>
                  <div className="text-[13px] font-extrabold leading-tight text-green-800">
                    File ready to be processed!
                  </div>
                  <div className="text-[11.5px] font-medium leading-tight text-green-600">
                    {uploadedFile.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer attached to the card */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              onClick={() => setWizardStep('job')}
              className="flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-800"
            >
              <span>←</span> Back
            </button>
            <button
              onClick={() => handleCvContextSubmit('saved', selectedCvId)}
              disabled={!selectedCvId || isLoading}
              className="group flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_4px_16px_rgba(13,148,136,0.25)] transition-all hover:-translate-y-0.5 hover:bg-teal-700 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Next: Final Touches
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default SleekCvStep;
// export default SleekCvStep;
