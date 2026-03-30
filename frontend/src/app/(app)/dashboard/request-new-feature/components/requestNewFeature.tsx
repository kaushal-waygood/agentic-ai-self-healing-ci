// 'use client';

// import React, { useState } from 'react';
// import {
//   Layers,
//   Home,
//   Briefcase,
//   FileText,
//   LayoutDashboard,
//   Plus,
//   ArrowRight,
//   Sparkles,
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import apiInstance from '@/services/api';

// const RequestNewFeature = () => {
//   const [featureName, setFeatureName] = useState('');
//   const [description, setDescription] = useState('');
//   const [submitted, setSubmitted] = useState(false);
//   const [focusedField, setFocusedField] = useState<string | null>(null);
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     try {
//       const response = await apiInstance.post('/new-feature', {
//         title: featureName,
//         description: description,
//       });
//       if (response.status === 200) {
//         setSubmitted(true);
//         setFeatureName('');
//         setDescription('');
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setSubmitted(false);
//     setFeatureName('');
//     setDescription('');
//   };

//   const navigationButtons = [
//     {
//       label: 'Submit Another Request',
//       icon: Plus,
//       action: handleReset,
//       primary: true,
//       gradient: 'buttonPrimary',
//     },
//     {
//       label: 'Dashboard',
//       icon: LayoutDashboard,
//       path: '/dashboard',
//       gradient: 'buttonPrimary',
//     },
//     {
//       label: 'Job Search',
//       icon: Briefcase,
//       path: '/dashboard/search-jobs',
//       gradient: 'buttonPrimary',
//     },
//     {
//       label: 'CV Generator',
//       icon: FileText,
//       path: '/dashboard/cv-generator',
//       gradient: 'buttonPrimary',
//     },
//     {
//       label: 'Home',
//       icon: Home,
//       path: '/',
//       gradient: 'buttonPrimary',
//     },
//   ];

//   return (
//     <div className="relative min-h-screen py-12 px-4 overflow-hidden">
//       <div className="max-w-3xl mx-auto relative z-10">
//         {submitted ? (
//           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//             {/* Success State */}
//             <div>
//               <div className="relative group">
//                 <div className="absolute -inset-1 rounded-lg group-hover:opacity-50 transition duration-300" />
//                 <div className="relative bg-white rounded-lg p-12  border border-green-200">
//                   <div className="flex flex-col items-center text-center space-y-6">
//                     <div className="relative">
//                       <div className="absolute inset-0 bg-green-100 rounded-full blur-lg" />
//                       <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center  animate-bounce">
//                         <span className="text-white text-4xl font-bold">✓</span>
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-3xl font-bold text-gray-900 mb-2">
//                         Success!
//                       </h3>
//                       <p className="text-green-700 font-medium text-lg">
//                         Your Request for New Feature has been Received
//                         Successfully
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation Buttons */}
//             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
//               <p className="text-center text-gray-700 font-semibold text-lg mb-6">
//                 What would you like to do next?
//               </p>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {navigationButtons.map((button, index) => {
//                   const Icon = button.icon;
//                   const isPrimary = button.primary;

//                   return (
//                     <button
//                       key={index}
//                       onClick={() =>
//                         button.action
//                           ? button.action()
//                           : router.push(button.path!)
//                       }
//                       className="group transition-all duration-300 hover:-translate-y-1  animate-in fade-in slide-in-from-bottom-4"
//                       style={{ animationDelay: `${100 + index * 50}ms` }}
//                     >
//                       <div className="relative overflow-hidden">
//                         <div
//                           className={`absolute inset-0 bg-${button.gradient} opacity-0 group-hover:opacity-10 transition duration-300`}
//                         />
//                         <div
//                           className={`relative flex items-center justify-between w-full px-6 py-4 rounded-lg border-2 transition-all ${
//                             isPrimary
//                               ? `border-blue-400 bg-${button.gradient} text-white `
//                               : 'border-gray-200 bg-white text-gray-800 hover:border-blue-300'
//                           }`}
//                         >
//                           <div className="flex items-center gap-3">
//                             <div
//                               className={`p-2.5 rounded-lg ${
//                                 isPrimary ? 'bg-white/20' : 'bg-gray-100'
//                               }`}
//                             >
//                               <Icon
//                                 className={`w-5 h-5 ${
//                                   isPrimary ? 'text-white' : 'text-gray-700'
//                                 }`}
//                               />
//                             </div>
//                             <span className="font-semibold text-sm md:text-base">
//                               {button.label}
//                             </span>
//                           </div>
//                           <ArrowRight
//                             className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
//                               isPrimary ? 'text-white' : 'text-gray-400'
//                             }`}
//                           />
//                         </div>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="animate-in fade-in slide-in-from-top-4 duration-500">
//             {/* Form State */}
//             <div className="relative group">
//               <div className="absolute -inset-1 rounded-lg opacity-30 group-hover:opacity-40 transition duration-500" />

//               <div className="relative bg-white rounded-lg  border border-gray-200 overflow-hidden">
//                 {/* Header */}
//                 <div className="bg-header-gradient-primary px-4 py-4 border-b border-gray-200">
//                   <div className="flex items-center gap-3 mb-1">
//                     <div className="p-2  rounded-lg ">
//                       <Layers className="w-6 h-6 text-white" />
//                     </div>
//                     <h2 className="text-3xl font-semibold text-gray-100 ">
//                       Request New Feature
//                     </h2>
//                   </div>
//                   <p className="text-gray-200 ml-11 text-sm">
//                     Share your innovative ideas with us
//                   </p>
//                 </div>

//                 {/* Form Content */}
//                 <form onSubmit={handleSubmit} className="p-8 space-y-6">
//                   {/* Feature Name Input */}
//                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                     <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
//                       <Sparkles className="w-4 h-4 text-blue-500" />
//                       Feature Name
//                     </label>
//                     <input
//                       type="text"
//                       value={featureName}
//                       onChange={(e) => setFeatureName(e.target.value)}
//                       onFocus={() => setFocusedField('name')}
//                       onBlur={() => setFocusedField(null)}
//                       placeholder="e.g., Real-time Notifications"
//                       required
//                       className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all duration-300 ${
//                         focusedField === 'name'
//                           ? 'border-blue-500 '
//                           : 'border-gray-200 '
//                       } placeholder-gray-400 `}
//                     />
//                   </div>

//                   {/* Description Input */}
//                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
//                     <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
//                       <Sparkles className="w-4 h-4 text-indigo-500" />
//                       Description
//                     </label>
//                     <textarea
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                       onFocus={() => setFocusedField('description')}
//                       onBlur={() => setFocusedField(null)}
//                       placeholder="Tell us more about your feature idea..."
//                       required
//                       className={`w-full px-4 py-3 rounded-lg border-2 h-32 resize-none outline-none transition-all duration-300 ${
//                         focusedField === 'description'
//                           ? 'border-indigo-500 '
//                           : 'border-gray-200 '
//                       } placeholder-gray-400 `}
//                     />
//                   </div>

//                   {/* Submit Button */}
//                   <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
//                     <button
//                       type="submit"
//                       disabled={isSubmitting}
//                       className="relative w-full group overflow-hidden"
//                     >
//                       <div className="relative bg-buttonPrimary text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
//                         <span className="">Submit Request</span>
//                         <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
//                       </div>
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RequestNewFeature;

'use client';

import React, { useState } from 'react';
import {
  Home,
  Briefcase,
  FileText,
  LayoutDashboard,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiInstance from '@/services/api';

const RequestNewFeature = () => {
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await apiInstance.post('/new-feature', {
        title: featureName,
        description: description,
      });
      if (response.status === 200) {
        setSubmitted(true);
        setFeatureName('');
        setDescription('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFeatureName('');
    setDescription('');
  };

  const navigationButtons = [
    {
      label: 'Submit Another Request',
      icon: Plus,
      action: handleReset,
      primary: true,
    },
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      label: 'Job Search',
      icon: Briefcase,
      path: '/dashboard/search-jobs',
    },
    {
      label: 'CV Generator',
      icon: FileText,
      path: '/dashboard/cv-generator',
    },
    {
      label: 'Home',
      icon: Home,
      path: '/',
    },
  ];

  return (
    <div className="relative flex  flex-col overflow-hidden bg-slate-50 font-jakarta text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      <main className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto p-6 md:p-8">
        <div className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          {!submitted ? (
            <>
              {/* Form Header */}
              <div className="border-b border-slate-100 px-8 pb-6 pt-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[14px] border border-blue-100/50 bg-blue-50 text-blue-600 shadow-sm">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h1 className="mb-2 text-[24px] font-black leading-tight tracking-tight text-slate-900 sm:text-[28px]">
                  Request New Feature
                </h1>
                <p className="text-[14px] font-medium text-slate-500">
                  Have an idea to make ZobsAI better? Share your innovative
                  concepts with our product team.
                </p>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-slate-50/30 p-8"
              >
                <div>
                  <label className="mb-2.5 flex items-center gap-2 text-[13px] font-extrabold text-slate-700">
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
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    Feature Name
                  </label>
                  <input
                    type="text"
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    placeholder="e.g., Real-time Application Notifications"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[14px] font-semibold text-slate-900 shadow-sm transition-all placeholder-slate-400 hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2.5 flex items-center gap-2 text-[13px] font-extrabold text-slate-700">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more about your feature idea. How would it help you? How should it work?"
                    required
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[14px] font-semibold leading-relaxed text-slate-900 shadow-sm transition-all placeholder-slate-400 hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-[14px] font-extrabold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    {!isSubmitting && (
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success State (Integrated into new UI style) */
            <div className="flex flex-col items-center p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-green-100 blur-lg" />
                <div className="relative flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
                  <span className="text-4xl font-bold text-white">✓</span>
                </div>
              </div>
              <h3 className="mb-2 text-center text-[28px] font-black tracking-tight text-slate-900">
                Success!
              </h3>
              <p className="mb-10 max-w-sm text-center text-[14.5px] font-medium leading-relaxed text-slate-500">
                Your request for a new feature has been received successfully.
              </p>

              <div className="w-full border-t border-slate-100 pt-8">
                <p className="mb-5 text-center text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  What's Next?
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {navigationButtons.map((button, index) => {
                    const Icon = button.icon;
                    return (
                      <button
                        key={index}
                        onClick={() =>
                          button.action
                            ? button.action()
                            : router.push(button.path!)
                        }
                        className={`group flex w-full items-center gap-3 rounded-[16px] border p-3 transition-all hover:-translate-y-0.5 ${
                          button.primary
                            ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:shadow-md'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${
                            button.primary
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-blue-600 transition-colors'
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div
                          className={`text-left text-[13px] font-bold ${
                            button.primary ? 'text-blue-900' : 'text-slate-800'
                          }`}
                        >
                          {button.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestNewFeature;
