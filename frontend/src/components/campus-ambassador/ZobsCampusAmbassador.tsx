// import React from 'react';
// import {
//   Users,
//   Trophy,
//   Rocket,
//   Target,
//   Award,
//   ChevronRight,
//   Zap,
//   TrendingUp,
//   UserPlus,
//   Presentation,
//   CheckCircle2,
//   Gift,
//   Briefcase,
//   Sparkles,
//   ArrowUpRight,
// } from 'lucide-react';

// const ZobsCampusAmbassador = () => {
//   return (
//     <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-500">
//       {/* Background Mesh Gradients - Pure CSS Decoration */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
//         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
//         <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-purple-400/10 dark:bg-purple-600/10 blur-[120px] rounded-full" />
//       </div>

//       {/* Hero Section */}
//       <section className="relative px-6 pt-24 pb-20 max-w-7xl mx-auto text-center">
//         <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 animate-bounce-subtle">
//           <Zap size={14} className="fill-current" />
//           <span>Applications for 2026 are now Open!</span>
//         </div>

//         <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
//           LEAD THE <br />
//           <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
//             AI REVOLUTION
//           </span>
//         </h1>

//         <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
//           The most elite student program for AI-forward thinkers. Shape the
//           future of recruitment tech while building your own legacy.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
//           <button className="group bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:scale-105 active:scale-95 transition-all px-10 py-5 rounded-2xl font-bold text-xl flex items-center gap-3 shadow-2xl shadow-blue-500/20">
//             Apply Now{' '}
//             <ChevronRight
//               size={22}
//               className="group-hover:translate-x-1 transition-transform"
//             />
//           </button>
//         </div>
//       </section>

//       {/* About ZobsAI - Image Replacement with stylized UI element */}
//       <section className="px-6 py-28 max-w-7xl mx-auto">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           <div className="relative group">
//             {/* FABULOUS DECORATION INSTEAD OF IMAGE */}
//             <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[3rem] blur-2xl opacity-20 dark:opacity-40 group-hover:opacity-30 transition-opacity" />
//             <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-sm overflow-hidden">
//               <div className="grid grid-cols-2 gap-6">
//                 <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
//                   <Sparkles className="text-blue-600 mb-4" />
//                   <div className="text-3xl font-black mb-1">98%</div>
//                   <div className="text-xs uppercase tracking-widest font-bold opacity-60">
//                     Accuracy
//                   </div>
//                 </div>
//                 <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
//                   <TrendingUp className="text-purple-600 mb-4" />
//                   <div className="text-3xl font-black mb-1">10x</div>
//                   <div className="text-xs uppercase tracking-widest font-bold opacity-60">
//                     Efficiency
//                   </div>
//                 </div>
//                 <div className="col-span-2 p-8 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white">
//                   <div className="flex justify-between items-center mb-4">
//                     <span className="font-bold">ZobsAI Engine v2.0</span>
//                     <div className="flex gap-1">
//                       <div className="w-2 h-2 rounded-full bg-red-500" />
//                       <div className="w-2 h-2 rounded-full bg-yellow-500" />
//                       <div className="w-2 h-2 rounded-full bg-green-500" />
//                     </div>
//                   </div>
//                   <div className="space-y-3">
//                     <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
//                       <div className="h-full w-3/4 bg-blue-400" />
//                     </div>
//                     <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
//                       <div className="h-full w-1/2 bg-purple-400" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-8">
//             <div className="inline-block">
//               <h2 className="text-4xl font-extrabold mb-2">About ZobsAI</h2>
//               <div className="h-1.5 w-1/2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
//             </div>
//             <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed">
//               We aren't just another job board. ZobsAI is an{' '}
//               <span className="text-slate-900 dark:text-white font-bold underline decoration-blue-500 underline-offset-4">
//                 intelligent career ecosystem
//               </span>
//               . We use proprietary neural matching to bridge the gap between
//               student potential and industry demand.
//             </p>
//             <div className="grid sm:grid-cols-2 gap-4">
//               {[
//                 'Smart Matching',
//                 'Profile Optimization',
//                 'ATS Insights',
//                 'Direct Connect',
//               ].map((item) => (
//                 <div
//                   key={item}
//                   className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300"
//                 >
//                   <div className="w-2 h-2 rounded-full bg-blue-500" /> {item}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Role & Responsibilities - Grid Glassmorphism */}
//       <section className="px-6 py-28 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="text-center mb-20">
//             <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase  tracking-tighter">
//               Your Mission
//             </h2>
//             <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
//               Responsibility meets Opportunity
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <MissionCard
//               icon={<UserPlus />}
//               title="Growth"
//               desc="Scale the ZobsAI footprint by onboarding the next generation of talent."
//             />
//             <MissionCard
//               icon={<Users />}
//               title="Community"
//               desc="Curate exclusive digital spaces for tech enthusiasts and career seekers."
//             />
//             <MissionCard
//               icon={<Presentation />}
//               title="Mentorship"
//               desc="Lead monthly micro-sessions that turn peers into professionals."
//             />
//             <MissionCard
//               icon={<Briefcase />}
//               title="Partnership"
//               desc="Bridge the gap between student bodies and our core development team."
//             />
//           </div>
//         </div>
//       </section>

//       {/* Who Can Apply - Stylized List */}
//       <section className="px-6 py-28 max-w-5xl mx-auto">
//         <div className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px]" />
//           <div className="relative z-10">
//             <h2 className="text-4xl font-black mb-12">Who fits the DNA?</h2>
//             <div className="grid md:grid-cols-2 gap-8">
//               <EligibilityBox
//                 title="Current Students"
//                 subtitle="UG/PG students from any field."
//               />
//               <EligibilityBox
//                 title="Communicators"
//                 subtitle="Natural leaders with a voice."
//               />
//               <EligibilityBox
//                 title="Tech Obsessed"
//                 subtitle="Fascinated by AI & careers."
//               />
//               <EligibilityBox
//                 title="Networkers"
//                 subtitle="Active in clubs or campus cells."
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Benefits - High Contrast Cards */}
//       <section className="px-6 py-28 max-w-7xl mx-auto">
//         <div className="text-center mb-20">
//           <h2 className="text-4xl font-black mb-4">THE PAYOFF</h2>
//           <div className="w-24 h-1 bg-blue-600 mx-auto" />
//         </div>

//         <div className="grid md:grid-cols-3 gap-8">
//           <RewardCard
//             icon={<Award />}
//             title="Elite Credentials"
//             desc="Signed certificates and LinkedIn endorsements from our founders."
//             gradient="from-blue-500 to-cyan-400"
//           />
//           <RewardCard
//             icon={<Rocket />}
//             title="Insider Access"
//             desc="Beta-test features 6 months before the general public."
//             gradient="from-purple-500 to-pink-500"
//           />
//           <RewardCard
//             icon={<Gift />}
//             title="Premium Perks"
//             desc="Exclusive ZobsAI merch, tech gear, and event tickets."
//             gradient="from-orange-500 to-yellow-500"
//           />
//         </div>
//       </section>

//       {/* Final CTA */}
//       <section className="px-6 py-32 text-center relative">
//         <div className="absolute inset-0 bg-blue-600 dark:bg-blue-700 -z-10 skew-y-2 translate-y-20" />
//         <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl shadow-black/20">
//           <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
//             Ready to claim your spot?
//           </h2>
//           <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/30">
//             SECURE YOUR APPLICATION
//           </button>
//           <p className="mt-8 font-bold text-slate-400 uppercase tracking-widest text-sm">
//             Deadline: February 2026
//           </p>
//         </div>
//       </section>

//       <footer className="px-6 py-12 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-tighter text-sm">
//         © 2026 Zobs AI • Built for the Bold.
//       </footer>
//     </div>
//   );
// };

// // Reusable Sub-components with High-End Styling

// const MissionCard = ({ icon, title, desc }) => (
//   <div className="group p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl hover:bg-slate-900 dark:hover:bg-white transition-all duration-300">
//     <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
//       {React.cloneElement(icon, { size: 28 })}
//     </div>
//     <h3 className="text-xl font-black mb-3 group-hover:text-white dark:group-hover:text-slate-950 transition-colors uppercase">
//       {title}
//     </h3>
//     <p className="text-slate-500 group-hover:text-slate-300 dark:group-hover:text-slate-600 font-medium leading-relaxed">
//       {desc}
//     </p>
//   </div>
// );

// const EligibilityBox = ({ title, subtitle }) => (
//   <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/10 dark:bg-slate-900/10 border border-white/20 dark:border-slate-200/20 backdrop-blur-sm">
//     <CheckCircle2 className="text-blue-400 dark:text-blue-600 shrink-0 mt-1" />
//     <div>
//       <div className="text-xl font-bold">{title}</div>
//       <div className="opacity-70 font-medium">{subtitle}</div>
//     </div>
//   </div>
// );

// const RewardCard = ({ icon, title, desc, gradient }) => (
//   <div className="relative group p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-xl hover:-translate-y-2 transition-all">
//     <div
//       className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-8 shadow-lg`}
//     >
//       {React.cloneElement(icon, { size: 32 })}
//     </div>
//     <h3 className="text-2xl font-black mb-4 uppercase">{title}</h3>
//     <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
//       {desc}
//     </p>
//     <div className="mt-6 flex items-center gap-2 text-blue-600 font-black text-sm uppercase cursor-pointer">
//       View Details <ArrowUpRight size={16} />
//     </div>
//   </div>
// );

// export default ZobsCampusAmbassador;
import { Users, Target, Award, Gift, Rocket, TrendingUp } from 'lucide-react';

function ZobsCampusAmbassador() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-100 text-blue-700 px-6 py-2 rounded-full text-sm font-semibold mb-6">
              Part-time | Student Leadership Role
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Become a ZobsAI
              </span>
              <br />
              <span className="text-gray-800">Campus Ambassador</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Lead your campus community. Empower peers with AI-powered career
              tools. Build leadership skills while making a real impact.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
                <span className="text-purple-600 font-semibold">
                  Remote / On-Campus
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
                <span className="text-blue-600 font-semibold">3-6 months</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
                <span className="text-purple-600 font-semibold">
                  2-3 hours/week
                </span>
              </div>
            </div>

            <a
              href="https://zobsai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Apply Now on ZobsAI Platform 
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students collaborating"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Build Community
              </h3>
              <p className="text-gray-600">
                Create and lead a thriving student community around career
                growth
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <img
                src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Leadership"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Gain Leadership
              </h3>
              <p className="text-gray-600">
                Develop real-world leadership and communication skills
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <img
                src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="AI Technology"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                AI & Tech Exposure
              </h3>
              <p className="text-gray-600">
                Get hands-on experience with cutting-edge AI career tools
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              About ZobsAI
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="AI Career Platform"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                ZobsAI is an AI-powered career platform that helps students and
                early-career professionals improve their job and internship
                outcomes through intelligent profile optimization and AI-driven
                job discovery.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-semibold text-gray-800">Smart Matching</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <Target className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="font-semibold text-gray-800">
                    Profile Optimization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Your Role & Responsibilities
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Promote & Onboard
              </h3>
              <p className="text-gray-600">
                Promote ZobsAI among students at your campus using your unique
                referral link. Help students onboard, complete their profiles,
                and use AI-powered features.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Build Community
              </h3>
              <p className="text-gray-600">
                Build and manage a "ZobsAI @ Campus" student community through
                WhatsApp or Telegram to keep students engaged and connected.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Conduct Sessions
              </h3>
              <p className="text-gray-600">
                Conduct at least one career-focused micro-session per month,
                either online or offline, to share insights and tips with your
                peers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Collaborate
              </h3>
              <p className="text-gray-600">
                Collaborate with student clubs, placement cells, or peer groups
                to maximize reach and impact across campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Who Can Apply
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Students working together"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Current Students
                  </h3>
                  <p className="text-gray-600">
                    Current undergraduate or postgraduate students from any
                    discipline
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Strong Communicator
                  </h3>
                  <p className="text-gray-600">
                    Excellent communication and peer engagement skills
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Passionate About Tech
                  </h3>
                  <p className="text-gray-600">
                    Interest in careers, AI, or technology
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Community Active
                  </h3>
                  <p className="text-gray-600">
                    Active in student communities or clubs (preferred, not
                    mandatory)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Perks & Benefits
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This is a performance-based role with exciting rewards and growth
              opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-9 h-9 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Official Recognition
              </h3>
              <p className="text-gray-600">
                ZobsAI Campus Ambassador Certificate and LinkedIn recommendation
                for top performers
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-9 h-9 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Premium Access
              </h3>
              <p className="text-gray-600">
                Access to premium ZobsAI tools and early access to new features
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-9 h-9 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Leadership Growth
              </h3>
              <p className="text-gray-600">
                Valuable leadership experience and startup exposure for your
                resume
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-9 h-9 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Performance-Based Compensation
              </h3>
              <p className="text-gray-600">
                Rewards based on your impact and engagement
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <img
                  src="/Gift/3.JPG"
                  alt="Gift cards"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="font-semibold text-gray-800">Gift Cards</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <img
                  src="/Gift/1.JPG"
                  alt="Hoodies"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="font-semibold text-gray-800">Branded Hoodies</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <img
                  src="/Gift/2.JPG"
                  alt="Water bottles"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="font-semibold text-gray-800">Water Bottles</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <img
                  src="/Gift/4.JPG"
                  alt="Tech products"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="font-semibold text-gray-800">Tech Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-10 rounded-3xl shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Selection & Performance
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                This is a non-salaried, performance-based ambassador role. Your
                performance is tracked based on student onboarding, community
                engagement, and consistency in executing your responsibilities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Track
                </div>
                <p className="text-gray-600">Student Onboarding</p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Measure
                </div>
                <p className="text-gray-600">Community Engagement</p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Reward
                </div>
                <p className="text-gray-600">Consistent Performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Lead and Make an Impact?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            If you enjoy leadership, community building, and helping peers with
            career growth using AI, this role is perfect for you. Join the
            ZobsAI Campus Ambassador community today!
          </p>

          <a
            href="https://zobsai.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 font-bold text-lg px-12 py-5 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:bg-gray-50"
          >
            Apply Now on ZobsAI Platform
          </a>

          <p className="text-blue-100 mt-8 text-sm">
            Applications are reviewed on a rolling basis
          </p>
        </div>
      </section>
    </div>
  );
}

export default ZobsCampusAmbassador;
