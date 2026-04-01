// import {
//   ArrowLeft,
//   Wand2,
//   Check,
//   Sparkles,
//   Target,
//   FileText,
//   User,
//   Lightbulb,
//   Star,
//   TrendingUp,
//   Award,
//   Rocket,
//   Palette,
//   Zap, // Add this import
// } from 'lucide-react';
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Textarea } from '@/components/ui/textarea';

// const CustomizeWizard = ({ handleGenerate, isLoading, setWizardStep }: any) => {
//   const [formData, setFormData] = useState({
//     tone: 'Formal',
//     style: 'Concise',
//     personalStory: '',
//   });

//   const toneOptions = [
//     { value: 'Formal', text: 'Formal', icon: Award, color: 'blue' },
//     {
//       value: 'Enthusiastic',
//       text: 'Enthusiastic',
//       icon: Star,
//       color: 'purple',
//     },
//     { value: 'Reserved', text: 'Reserved', icon: User, color: 'green' },
//     { value: 'Casual', text: 'Casual', icon: Lightbulb, color: 'yellow' },
//   ];

//   const styleOptions = [
//     { value: 'Concise', text: 'Concise', icon: Zap, color: 'orange' },
//     { value: 'Detailed', text: 'Detailed', icon: Target, color: 'red' },
//   ];

//   const getColorClasses = (color, selected) => {
//     const colors = {
//       blue: selected
//         ? 'bg-blue-500 text-white'
//         : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
//       yellow: selected
//         ? 'bg-yellow-500 text-white'
//         : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
//       green: selected
//         ? 'bg-green-500 text-white'
//         : 'bg-green-50 text-green-600 hover:bg-green-100',
//       purple: selected
//         ? 'bg-purple-500 text-white'
//         : 'bg-purple-50 text-purple-600 hover:bg-purple-100',
//       orange: selected
//         ? 'bg-orange-500 text-white'
//         : 'bg-orange-50 text-orange-600 hover:bg-orange-100',
//       red: selected
//         ? 'bg-red-500 text-white'
//         : 'bg-red-50 text-red-600 hover:bg-red-100',
//     };
//     return colors[color] || colors.blue;
//   };

//   const updateFormData = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="flex items-center justify-center p-2 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Progress Indicator */}
//         <div className="flex items-center justify-center mb-4">
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
//                 <Check className="h-4 w-4 text-white" />
//               </div>
//               <span className="hidden sm:inline text-sm font-medium text-green-600">
//                 Job Context
//               </span>
//             </div>
//             <div className="w-12 h-0.5 bg-green-500"></div>
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
//                 <Check className="h-4 w-4 text-white" />
//               </div>
//               <span className="hidden sm:inline text-sm font-medium text-green-600">
//                 Your CV
//               </span>
//             </div>
//             <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-indigo-500"></div>
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
//                 <span className="text-white font-bold text-sm">3</span>
//               </div>
//               <span className="hidden sm:inline text-sm font-medium text-indigo-600">
//                 Final Touches
//               </span>
//             </div>
//           </div>
//         </div>

//         <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-indigo-500/10 rounded-lg overflow-hidden">
//           {/* Header */}
//           <CardHeader className="p-2 bg-header-gradient-primary text-white relative overflow-hidden">
//             <div className="relative z-10">
//               <div className="flex items-center gap-3 ">
//                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Wand2 className="h-5 w-5 text-white" />
//                 </div>
//                 <CardTitle className="text-xl ">
//                   Step 3: Final Touches
//                 </CardTitle>
//               </div>
//               <CardDescription className="text-indigo-100 text-base">
//                 Add your personal touch to make your cover letter stand out.
//               </CardDescription>
//             </div>
//           </CardHeader>

//           <CardContent className="p-4 space-y-4">
//             {/* Quick Suggestions */}
//             <div className="space-y-2">
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                 <Sparkles className="h-5 w-5 text-indigo-500" />
//                 Quick Enhancement Options
//               </h3>
//               {/* Tone Options */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 {toneOptions.map((option) => {
//                   const Icon = option.icon;
//                   const isSelected = formData.tone === option.value;
//                   return (
//                     <button
//                       key={option.value}
//                       onClick={() => updateFormData('tone', option.value)}
//                       className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
//                         isSelected
//                           ? `${getColorClasses(
//                               option.color,
//                               true,
//                             )} border-transparent shadow-lg`
//                           : `${getColorClasses(
//                               option.color,
//                               false,
//                             )} border-gray-200 hover:border-gray-300`
//                       }`}
//                     >
//                       <div className="flex items-center gap-2">
//                         <Icon className="h-4 w-4" />
//                         <span className="text-sm font-medium">
//                           {option.text}
//                         </span>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//               {/* Style Options */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 {styleOptions.map((option) => {
//                   const Icon = option.icon;
//                   const isSelected = formData.style === option.value;
//                   return (
//                     <button
//                       key={option.value}
//                       onClick={() => updateFormData('style', option.value)}
//                       className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
//                         isSelected
//                           ? `${getColorClasses(
//                               option.color,
//                               true,
//                             )} border-transparent shadow-lg`
//                           : `${getColorClasses(
//                               option.color,
//                               false,
//                             )} border-gray-200 hover:border-gray-300`
//                       }`}
//                     >
//                       <div className="flex items-center gap-2">
//                         <Icon className="h-4 w-4" />
//                         <span className="text-sm font-medium">
//                           {option.text}
//                         </span>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//               <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
//                 <div className="flex items-center gap-2 text-indigo-700 text-sm font-medium">
//                   <Check className="h-4 w-4" />
//                   Selected Tone: {formData.tone} & Style: {formData.style}
//                 </div>
//               </div>
//             </div>

//             {/* Divider */}
//             <div className="flex items-center gap-4">
//               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
//               <span className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border">
//                 AND/OR
//               </span>
//               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
//             </div>

//             {/* Custom Narratives */}
//             <div className="space-y-2">
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                 <FileText className="h-5 w-5 text-indigo-500" />
//                 Add a Personal Story
//               </h3>
//               <div className="relative group">
//                 <Textarea
//                   placeholder="Share a specific achievement, personal connection to the company, or unique experience that makes you stand out..."
//                   className="min-h-[150px] border-2 border-gray-200 rounded-lg p-4 focus:border-indigo-500 focus:ring-0 resize-none transition-all duration-300 group-hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm text-base leading-relaxed"
//                   value={formData.personalStory}
//                   onChange={(e) =>
//                     updateFormData('personalStory', e.target.value)
//                   }
//                 />
//                 <div className="absolute top-4 right-4 text-gray-400">
//                   <Lightbulb className="h-5 w-5" />
//                 </div>
//               </div>
//             </div>

//             {/* AI Enhancement Preview */}
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 border border-indigo-100">
//               <div className="flex items-center gap-3 ">
//                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
//                   <Rocket className="h-5 w-5 text-white" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900">
//                   AI Enhancement Ready
//                 </h4>
//               </div>
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 Our AI will analyze your job requirements, CV, and enhancement
//                 preferences to create a perfectly tailored cover letter that
//                 highlights your strengths.
//               </p>
//             </div>
//           </CardContent>

//           {/* Footer */}
//           <CardFooter className="bg-gray-50/80 backdrop-blur-xl border-t border-gray-100 p-6">
//             <div className="flex items-center flex-wrap justify-between w-full">
//               <button
//                 onClick={() => setWizardStep('cv')}
//                 className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
//                 disabled={isLoading}
//               >
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back to CV Context
//               </button>

//               <Button
//                 size="lg"
//                 onClick={handleGenerate}
//                 disabled={isLoading}
//                 className={`h-14 px-8 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] ${
//                   isLoading
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : 'hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 '
//                 } text-white`}
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
//                     Generating Cover Letter...
//                   </>
//                 ) : (
//                   <>
//                     <Wand2 className="mr-3 h-5 w-5" />
//                     Generate Cover Letter
//                   </>
//                 )}
//               </Button>
//             </div>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CustomizeWizard;

'use client';

import {
  ArrowLeft,
  Wand2,
  Check,
  Sparkles,
  Target,
  User,
  Lightbulb,
  Star,
  TrendingUp,
  Award,
  Rocket,
  Zap,
  FileSignature,
  FileText,
  Loader2,
} from 'lucide-react';
import React, { useState } from 'react';

const CustomizeWizard = ({ handleGenerate, isLoading, setWizardStep }: any) => {
  const [formData, setFormData] = useState({
    tone: 'Formal',
    style: 'Concise',
    personalStory: '',
  });

  const toneOptions = [
    { value: 'Formal', text: 'Formal', icon: Award, color: 'blue' },
    {
      value: 'Enthusiastic',
      text: 'Enthusiastic',
      icon: Star,
      color: 'purple',
    },
    { value: 'Reserved', text: 'Reserved', icon: User, color: 'emerald' },
    { value: 'Casual', text: 'Casual', icon: Lightbulb, color: 'amber' },
  ];

  const styleOptions = [
    { value: 'Concise', text: 'Concise', icon: Zap, color: 'orange' },
    { value: 'Detailed', text: 'Detailed', icon: Target, color: 'rose' },
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const colors: any = {
      blue: selected
        ? 'border-blue-400 bg-blue-100 text-blue-800 shadow-sm'
        : 'border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50',
      amber: selected
        ? 'border-amber-400 bg-amber-100 text-amber-800 shadow-sm'
        : 'border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-50',
      emerald: selected
        ? 'border-emerald-400 bg-emerald-100 text-emerald-800 shadow-sm'
        : 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50',
      purple: selected
        ? 'border-purple-400 bg-purple-100 text-purple-800 shadow-sm'
        : 'border-purple-200 bg-purple-50/50 text-purple-700 hover:bg-purple-50',
      orange: selected
        ? 'border-orange-400 bg-orange-100 text-orange-800 shadow-sm'
        : 'border-orange-200 bg-orange-50/50 text-orange-700 hover:bg-orange-50',
      rose: selected
        ? 'border-rose-400 bg-rose-100 text-rose-800 shadow-sm'
        : 'border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50',
    };
    return colors[color] || colors.blue;
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-6 font-jakarta antialiased">
      {/* <div className="mx-auto flex h-full w-full max-w-[850px] flex-col"> */}
      <div className="mx-auto flex h-full w-full  flex-col">
        {/* HEADER & STEPPER */}
        <div className="mb-6 shrink-0">
          <div className="mb-6 text-center">
            <h1 className="text-[22px] font-black uppercase tracking-tight text-slate-900 md:text-[26px]">
              AI Cover Letter Generator
            </h1>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">
              Transform your Cover Letter with AI-powered insights tailored to
              your dream job.
            </p>
          </div>

          <div className="mx-auto flex max-w-[400px] items-center justify-center relative">
            <div className="absolute left-8 right-8 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-slate-200"></div>
            {/* Step 3 Progress Line (100%) */}
            <div className="absolute left-8 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-emerald-500 transition-all duration-500"></div>

            <div className="relative z-10 flex w-full justify-between">
              {/* Step 1 Completed */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Job Context
                </span>
              </div>
              {/* Step 2 Completed */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  CV Context
                </span>
              </div>
              {/* Step 3 Active */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300 animate-pulse">
                  3
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                  Final Touches
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN WIZARD CARD */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm animate-in fade-in duration-500">
          {/* Card Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
              <Wand2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-slate-900">
                Step 3: Final Touches
              </h2>
              <p className="text-[12px] font-medium text-slate-500">
                Add your personal touch to make your cover letter stand out.
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-6 gap-6">
            {/* Tone & Style Selection */}
            <div className="shrink-0 space-y-4">
              <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                <Sparkles
                  className="h-4 w-4 text-indigo-500"
                  strokeWidth={2.5}
                />
                Letter Tone & Style
              </h3>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.tone === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.preventDefault();
                          updateFormData('tone', option.value);
                        }}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold transition-all ${getColorClasses(
                          option.color,
                          isSelected,
                        )}`}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {option.text}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.style === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.preventDefault();
                          updateFormData('style', option.value);
                        }}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold transition-all ${getColorClasses(
                          option.color,
                          isSelected,
                        )}`}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Narrative Textarea */}
            <div className="flex min-h-[160px] flex-1 flex-col">
              <h3 className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                <FileText className="h-4 w-4 text-blue-500" strokeWidth={2.5} />
                Add a Personal Story
                <span className="text-[10px] font-medium text-slate-400">
                  (Optional)
                </span>
              </h3>
              <div className="relative flex-1">
                <textarea
                  placeholder="Share a specific achievement, personal connection to the company, or unique experience that makes you stand out..."
                  className="custom-scrollbar absolute inset-0 h-full w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13.5px] font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50"
                  value={formData.personalStory}
                  onChange={(e) =>
                    updateFormData('personalStory', e.target.value)
                  }
                ></textarea>
                <div className="pointer-events-none absolute right-4 top-4 text-slate-400">
                  <Lightbulb className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* AI Enhancement Info Box */}
            <div className="flex shrink-0 items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
                <Rocket className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="mb-1 text-[13px] font-extrabold leading-tight text-slate-900">
                  AI Enhancement Ready
                </h4>
                <p className="text-[11.5px] font-medium leading-relaxed text-slate-600">
                  Our AI will analyze your job requirements, CV context, and
                  stylistic preferences to craft a perfectly tailored cover
                  letter that highlights your unique strengths.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={() => setWizardStep('cv')}
              disabled={isLoading}
              className="flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-800 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
              <span>Back</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  Generating...
                </>
              ) : (
                <>
                  Generate Cover Letter
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
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

export default CustomizeWizard;
