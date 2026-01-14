// import { Sparkles, Users, CreditCard } from 'lucide-react';

// export default function HeroSection() {
//   return (
//     <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white overflow-hidden">
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
//         <div className="text-center space-y-8">
//           <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 text-sm font-medium animate-pulse">
//             <Sparkles className="w-4 h-4" />
//             <span>Limited to First 1,000 Students Only</span>
//           </div>

//           <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
//             Students Get
//             <br />
//             <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
//               12 Months Free
//             </span>
//           </h1>

//           <p className="text-xl sm:text-2xl md:text-3xl text-blue-100 font-light max-w-3xl mx-auto">
//             Land internships & jobs faster with AI
//           </p>

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
//             <a
//               href="https://zobsai.com/"
//               className="group w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
//             >
//               Claim 12 Months Free
//               <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
//             </a>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
//                 <CreditCard className="w-5 h-5" />
//               </div>
//               <span className="font-medium">No Payment Required</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
//                 <Users className="w-5 h-5" />
//               </div>
//               <span className="font-medium">Student ID Verification</span>
//             </div>
//           </div>

//           <div className="pt-8 animate-bounce">
//             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm">
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 14l-7 7m0 0l-7-7m7 7V3"
//                 />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import {
  Sparkles,
  Users,
  CreditCard,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

export default function HeroSection() {
  const scrollToContent = () => {
    // Find the element by the ID we just created
    const target = document.getElementById('offer-details');

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // Aligns the top of the element to the top of the viewport
      });
    }
  };
  return (
    <section className="relative  text-gray-900 overflow-hidden py-16 sm:py-8 mb-4">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 ">
          {/* Badge - Clean border style */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-1.5 text-xs font-semibold text-blue-600">
            <Sparkles className="w-4 h-4" />
            <span>Limited to First 1,000 Students Only</span>
          </div>

          {/* Headline - Clean Typography with Gradient Accent */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Students Get
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              12 Months Free
            </span>
          </h1>

          {/* Subtext - Balanced font weight */}
          <p className="text-xs sm:text-sm md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Land internships & jobs faster with AI. Built specifically for the
            next generation of professionals.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <a
              onClick={scrollToContent}
              className="w-full sm:w-auto bg-blue-600 text-white px-5 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Claim 12 Months Free
              <ArrowDown className="w-5 h-5" />
            </a>
            {/* 
            <button className="text-slate-500 font-semibold hover:text-blue-600 transition-colors">
              How it works
            </button> */}
          </div>

          {/* Social Proof / Features - Minimalist style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payment
                </p>
                <p className="font-semibold text-slate-800">
                  No Credit Card Needed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Eligibility
                </p>
                <p className="font-semibold text-slate-800">
                  Student ID Verification
                </p>
              </div>
            </div>
            <div className="pt-12 animate-bounce flex justify-center">
              <button
                onClick={scrollToContent}
                aria-label="Scroll down"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-200 text-blue-600 shadow-sm hover:bg-white hover:shadow-md transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
