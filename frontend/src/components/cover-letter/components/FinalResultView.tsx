'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, FileText, ListRestart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  cvlink?: string;
  rateLimited?: boolean;
  rateLimitMessage?: string | null;
  planPath?: string;
  title?: string;
  targetLink?: string;
  incompleteProfile?: string | null;
};

export default function FinalResultView({
  cvlink,
  rateLimited,
  rateLimitMessage = null,
  planPath = '/dashboard/plans',
  title,
  targetLink,
  incompleteProfile,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If profile is incomplete, stop spinner immediately
    if (incompleteProfile) {
      setIsGenerating(false);
      setShowNotification(false);
      return;
    }

    if (!rateLimited) {
      const t = setTimeout(() => {
        setIsGenerating(false);
        setShowNotification(true);
      }, 1800);
      return () => clearTimeout(t);
    } else {
      setIsGenerating(false);
      setShowNotification(false);
    }
  }, [rateLimited, incompleteProfile]);

  const handleRedirectDocs = () => {
    if (typeof targetLink === 'string' && targetLink.length > 0) {
      router.push(targetLink);
    } else {
      router.push('/dashboard/my-docs');
    }
  };

  const handleGoToPlans = () => {
    router.push(planPath);
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* RATE LIMIT */}
          {rateLimited ? (
            <>
              <div className="mb-6">
                <FileText className="w-20 h-20 text-amber-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Upgrade Required
              </h2>
              <p className="text-gray-600 mb-4">
                {rateLimitMessage ||
                  'You have hit your cover-letter generation limit for your current plan.'}
              </p>

              <div className="flex gap-3 flex-col">
                <button
                  onClick={handleGoToPlans}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  View Plans & Purchase
                </button>

                <button
                  onClick={handleRedirectDocs}
                  className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg"
                >
                  View Doc Status
                </button>
              </div>
            </>
          ) : incompleteProfile ? (
            /* PROFILE INCOMPLETE */
            <>
              <div className="mb-6">
                <FileText className="w-20 h-20 text-red-500 mx-auto" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Complete your profile
              </h2>

              <p className="text-gray-600 mb-3">
                We need a few more details before generating your {title}.
              </p>

              <p className="text-sm text-red-600 mb-6">{incompleteProfile}</p>

              <div className="flex gap-3 flex-col">
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Complete Profile
                </button>

                <button
                  onClick={handleRedirectDocs}
                  className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg"
                >
                  View Documents
                </button>
              </div>
            </>
          ) : isGenerating ? (
            /* GENERATING */
            <>
              <div className="mb-6">
                <div className="relative inline-block">
                  <FileText className="w-20 h-20 text-indigo-600 mx-auto" />
                  <Loader2 className="w-8 h-8 text-indigo-600 absolute -top-2 -right-2 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Generating Your {title}...
              </h2>
              <p className="text-gray-600 mb-6">
                Running in the background. This may take a few moments.
              </p>
            </>
          ) : (
            /* SUCCESS / ADDED TO QUEUE */
            // <>
            //   <div className="mb-6 relative flex items-center justify-center h-24">
            //     {/* The background "Queue/List" icon */}
            //     <div className="relative">
            //       <div className="p-4 bg-indigo-50 rounded-2xl">
            //         <FileText className="w-12 h-12 text-indigo-300" />
            //       </div>

            //       {/* The Active Spinner overlayed on the corner */}
            //       <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
            //         <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            //       </div>

            //       {/* Subtle pulsing ring to show "active" status */}
            //       <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 animate-ping opacity-20"></div>
            //     </div>
            //   </div>
            //   <h2 className="text-2xl font-bold text-gray-800 mb-2">
            //     Document is being generated
            //   </h2>

            //   <p className="text-gray-600 mb-2">
            //     Your request has been added to the queue successfully.
            //   </p>

            //   <p className="text-sm text-indigo-600 bg-indigo-50 py-2 px-4 rounded-full inline-block mb-8">
            //     You can safely continue with other operations.
            //   </p>

            //   <div className="flex gap-3 flex-col">
            //     <button
            //       onClick={handleRedirectDocs}
            //       className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            //     >
            //       View Status
            //     </button>

            //     <button
            //       onClick={() => router.push('/dashboard')}
            //       className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            //     >
            //       Continue Other Operations
            //     </button>
            //   </div>
            // </>
            /* UPGRADED INTERACTIVE QUEUE STATE */
            <>
              {/* 1. Dynamic Layered Animation */}
              <div className="mb-8 relative flex items-center justify-center h-32">
                <div className="relative group">
                  {/* Outer glowing background */}
                  <div className="absolute inset-0 bg-indigo-200 rounded-2xl blur-xl opacity-20 animate-pulse"></div>

                  {/* Main Icon Container */}
                  <div className="relative p-6 bg-white border border-indigo-50 rounded-2xl shadow-sm z-10">
                    <FileText className="w-12 h-12 text-indigo-500" />

                    {/* Floating Status Indicator */}
                    <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1.5 shadow-lg border-2 border-white">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  </div>

                  {/* Decorative "Queue" items behind the main file */}
                  <div className="absolute top-2 -left-4 w-12 h-12 bg-gray-100 rounded-lg -z-10 rotate-[-10deg] border border-gray-200 opacity-50"></div>
                  <div className="absolute top-4 -left-2 w-12 h-12 bg-gray-50 rounded-lg -z-10 rotate-[-5deg] border border-gray-200 opacity-80"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Document is being generated
              </h2>

              {/* 2. Interactive Steps Indicator */}
              <div className="flex flex-col gap-4 mb-8 max-w-xs mx-auto text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Request received
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-indigo-600">
                    Added to queue & processing
                  </span>
                </div>

                <div className="flex items-center gap-3 opacity-40">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    Document ready
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50/50 rounded-xl p-4 mb-8 border border-indigo-100/50">
                <p className="text-sm text-indigo-800 leading-relaxed">
                  Your document is in safe hands. You can continue with other
                  operations; we'll notify you when it's done.
                </p>
              </div>

              <div className="flex gap-3 flex-col">
                <button
                  onClick={handleRedirectDocs}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  View Live Status
                </button>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Other Operations
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   CheckCircle,
//   FileText,
//   Loader2,
//   Clock,
//   CheckCircle2,
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import apiInstance from '@/services/api';

// type Props = {
//   documentId?: string; // IMPORTANT: Pass the ID of the doc being generated
//   type?: 'cv' | 'coverLetter' | 'application'; // IMPORTANT: Pass the type
//   cvlink?: string;
//   rateLimited?: boolean;
//   rateLimitMessage?: string | null;
//   planPath?: string;
//   title?: string;
//   targetLink?: string;
//   incompleteProfile?: string | null;
// };

// export default function FinalResultView({
//   documentId,
//   type = 'cv',
//   cvlink,
//   rateLimited,
//   rateLimitMessage = null,
//   planPath = '/dashboard/plans',
//   title,
//   targetLink,
//   incompleteProfile,
// }: Props) {
//   const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>(
//     'pending',
//   );
//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const router = useRouter();

//   // Polling Logic
//   useEffect(() => {
//     if (incompleteProfile || rateLimited || !documentId) {
//       setIsInitialLoading(false);
//       return;
//     }

//     const checkStatus = async () => {
//       try {
//         let endpoint = '';
//         switch (type) {
//           case 'cv':
//             endpoint = `/students/status/cv/${documentId}`;
//             break;
//           case 'coverLetter':
//             endpoint = `/students/status/cl/${documentId}`;
//             break;
//           case 'application':
//             endpoint = `/students/status/tailored/${documentId}`;
//             break;
//         }

//         const { data } = await apiInstance.get(endpoint);
//         const currentStatus = data.document?.status || data.item?.status;

//         // Normalize status
//         if (currentStatus === 'completed' || currentStatus === 'new') {
//           setStatus('completed');
//           setIsInitialLoading(false);
//         } else if (currentStatus === 'failed') {
//           setStatus('failed');
//           setIsInitialLoading(false);
//         }
//       } catch (error) {
//         console.error('Error polling status:', error);
//       }
//     };

//     // Initial check after a small delay to let backend process
//     const timer = setTimeout(() => {
//       setIsInitialLoading(false);
//       checkStatus();
//     }, 1800);

//     // Poll every 6 seconds (same as DocumentCard)
//     const interval = setInterval(() => {
//       if (status === 'pending') {
//         checkStatus();
//       }
//     }, 6000);

//     return () => {
//       clearTimeout(timer);
//       clearInterval(interval);
//     };
//   }, [documentId, status, type, incompleteProfile, rateLimited]);

//   const handleRedirectDocs = () => {
//     router.push(targetLink || '/dashboard/my-docs');
//   };

//   return (
//     <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
//           {rateLimited /* ... Keep existing Rate Limit UI ... */ ? null : incompleteProfile /* ... Keep existing Incomplete Profile UI ... */ ? null : isInitialLoading ? (
//             /* --- 1. INITIAL LOADING (Fake spinner for smooth transition) --- */
//             <div className="py-10">
//               <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
//               <p className="text-gray-500 animate-pulse">
//                 Initializing document engine...
//               </p>
//             </div>
//           ) : status === 'completed' ? (
//             /* --- 2. SUCCESS STATE (Shows when status is completed) --- */
//             <>
//               <div className="mb-8 flex items-center justify-center">
//                 <div className="relative p-6 bg-green-50 rounded-full border-4 border-white shadow-lg">
//                   <CheckCircle2 className="w-16 h-16 text-green-600" />
//                   <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20 -z-10"></div>
//                 </div>
//               </div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                 {title} Ready!
//               </h2>
//               <p className="text-gray-600 mb-8">
//                 Generated and tailored successfully.
//               </p>
//               <div className="flex gap-3 flex-col">
//                 <button
//                   onClick={handleRedirectDocs}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
//                 >
//                   View {title}
//                 </button>
//               </div>
//             </>
//           ) : (
//             /* --- 3. PENDING/QUEUE STATE (Your Interactive UI) --- */
//             <>
//               <div className="mb-8 relative flex items-center justify-center h-32">
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-indigo-200 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
//                   <div className="relative p-6 bg-white border border-indigo-50 rounded-2xl shadow-sm z-10">
//                     <FileText className="w-12 h-12 text-indigo-500" />
//                     <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1.5 shadow-lg border-2 border-white">
//                       <Loader2 className="w-5 h-5 text-white animate-spin" />
//                     </div>
//                   </div>
//                   <div className="absolute top-2 -left-4 w-12 h-12 bg-gray-100 rounded-lg -z-10 rotate-[-10deg] opacity-40"></div>
//                   <div className="absolute top-4 -left-2 w-12 h-12 bg-gray-50 rounded-lg -z-10 rotate-[-5deg] opacity-70"></div>
//                 </div>
//               </div>

//               <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                 Generating Document
//               </h2>

//               <div className="flex flex-col gap-4 mb-8 max-w-[280px] mx-auto text-left">
//                 <div className="flex items-center gap-3">
//                   <CheckCircle className="h-5 w-5 text-green-500" />
//                   <span className="text-sm font-medium text-gray-600">
//                     Request received
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="h-5 w-5 flex items-center justify-center">
//                     <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
//                   </div>
//                   <span className="text-sm font-bold text-indigo-600">
//                     In Queue & Processing
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-3 opacity-30">
//                   <Clock className="h-5 w-5 text-gray-400" />
//                   <span className="text-sm font-medium text-gray-500">
//                     Document ready
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-indigo-50/50 rounded-2xl p-4 mb-8 border border-indigo-100/50 text-sm text-indigo-800">
//                 Processing your {title}. You can wait here or continue other
//                 tasks.
//               </div>

//               <div className="flex gap-3 flex-col">
//                 <button
//                   onClick={handleRedirectDocs}
//                   className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-all"
//                 >
//                   View Status
//                 </button>
//                 <button
//                   onClick={() => router.push('/dashboard')}
//                   className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors"
//                 >
//                   Continue Other Operations
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
