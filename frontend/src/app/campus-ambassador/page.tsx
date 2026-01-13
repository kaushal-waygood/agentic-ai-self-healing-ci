import React from 'react';
import {
  Users,
  Trophy,
  Rocket,
  Target,
  Award,
  ChevronRight,
  Zap,
  TrendingUp,
  UserPlus,
  Presentation,
  CheckCircle2,
  Gift,
  Briefcase,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Navigation } from '@/components/layout/site-header';

const ZobsCampusAmbassador = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-500">
      <Navigation />

      {/* Background Mesh Gradients - Pure CSS Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-purple-400/10 dark:bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 animate-bounce-subtle">
          <Zap size={14} className="fill-current" />
          <span>Applications for 2026 are now Open!</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
          LEAD THE <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
            AI REVOLUTION
          </span>
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
          The most elite student program for AI-forward thinkers. Shape the
          future of recruitment tech while building your own legacy.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="group bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:scale-105 active:scale-95 transition-all px-10 py-5 rounded-2xl font-bold text-xl flex items-center gap-3 shadow-2xl shadow-blue-500/20">
            Apply Now{' '}
            <ChevronRight
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </section>

      {/* About ZobsAI - Image Replacement with stylized UI element */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            {/* FABULOUS DECORATION INSTEAD OF IMAGE */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[3rem] blur-2xl opacity-20 dark:opacity-40 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <Sparkles className="text-blue-600 mb-4" />
                  <div className="text-3xl font-black mb-1">98%</div>
                  <div className="text-xs uppercase tracking-widest font-bold opacity-60">
                    Accuracy
                  </div>
                </div>
                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <TrendingUp className="text-purple-600 mb-4" />
                  <div className="text-3xl font-black mb-1">10x</div>
                  <div className="text-xs uppercase tracking-widest font-bold opacity-60">
                    Efficiency
                  </div>
                </div>
                <div className="col-span-2 p-8 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">ZobsAI Engine v2.0</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-blue-400" />
                    </div>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="inline-block">
              <h2 className="text-4xl font-extrabold mb-2">About ZobsAI</h2>
              <div className="h-1.5 w-1/2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed">
              We aren't just another job board. ZobsAI is an{' '}
              <span className="text-slate-900 dark:text-white font-bold underline decoration-blue-500 underline-offset-4">
                intelligent career ecosystem
              </span>
              . We use proprietary neural matching to bridge the gap between
              student potential and industry demand.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Smart Matching',
                'Profile Optimization',
                'ATS Insights',
                'Direct Connect',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role & Responsibilities - Grid Glassmorphism */}
      <section className="px-6 py-28 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase  tracking-tighter">
              Your Mission
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
              Responsibility meets Opportunity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MissionCard
              icon={<UserPlus />}
              title="Growth"
              desc="Scale the ZobsAI footprint by onboarding the next generation of talent."
            />
            <MissionCard
              icon={<Users />}
              title="Community"
              desc="Curate exclusive digital spaces for tech enthusiasts and career seekers."
            />
            <MissionCard
              icon={<Presentation />}
              title="Mentorship"
              desc="Lead monthly micro-sessions that turn peers into professionals."
            />
            <MissionCard
              icon={<Briefcase />}
              title="Partnership"
              desc="Bridge the gap between student bodies and our core development team."
            />
          </div>
        </div>
      </section>

      {/* Who Can Apply - Stylized List */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <div className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px]" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-12">Who fits the DNA?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <EligibilityBox
                title="Current Students"
                subtitle="UG/PG students from any field."
              />
              <EligibilityBox
                title="Communicators"
                subtitle="Natural leaders with a voice."
              />
              <EligibilityBox
                title="Tech Obsessed"
                subtitle="Fascinated by AI & careers."
              />
              <EligibilityBox
                title="Networkers"
                subtitle="Active in clubs or campus cells."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - High Contrast Cards */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black mb-4">THE PAYOFF</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <RewardCard
            icon={<Award />}
            title="Elite Credentials"
            desc="Signed certificates and LinkedIn endorsements from our founders."
            gradient="from-blue-500 to-cyan-400"
          />
          <RewardCard
            icon={<Rocket />}
            title="Insider Access"
            desc="Beta-test features 6 months before the general public."
            gradient="from-purple-500 to-pink-500"
          />
          <RewardCard
            icon={<Gift />}
            title="Premium Perks"
            desc="Exclusive ZobsAI merch, tech gear, and event tickets."
            gradient="from-orange-500 to-yellow-500"
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32 text-center relative">
        <div className="absolute inset-0 bg-blue-600 dark:bg-blue-700 -z-10 skew-y-2 translate-y-20" />
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl shadow-black/20">
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
            Ready to claim your spot?
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/30">
            SECURE YOUR APPLICATION
          </button>
          <p className="mt-8 font-bold text-slate-400 uppercase tracking-widest text-sm">
            Deadline: February 2026
          </p>
        </div>
      </section>

      <footer className="px-6 py-12 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-tighter text-sm">
        © 2026 Zobs AI • Built for the Bold.
      </footer>
    </div>
  );
};

// Reusable Sub-components with High-End Styling

const MissionCard = ({ icon, title, desc }) => (
  <div className="group p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl hover:bg-slate-900 dark:hover:bg-white transition-all duration-300">
    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <h3 className="text-xl font-black mb-3 group-hover:text-white dark:group-hover:text-slate-950 transition-colors uppercase">
      {title}
    </h3>
    <p className="text-slate-500 group-hover:text-slate-300 dark:group-hover:text-slate-600 font-medium leading-relaxed">
      {desc}
    </p>
  </div>
);

const EligibilityBox = ({ title, subtitle }) => (
  <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/10 dark:bg-slate-900/10 border border-white/20 dark:border-slate-200/20 backdrop-blur-sm">
    <CheckCircle2 className="text-blue-400 dark:text-blue-600 shrink-0 mt-1" />
    <div>
      <div className="text-xl font-bold">{title}</div>
      <div className="opacity-70 font-medium">{subtitle}</div>
    </div>
  </div>
);

const RewardCard = ({ icon, title, desc, gradient }) => (
  <div className="relative group p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-xl hover:-translate-y-2 transition-all">
    <div
      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-8 shadow-lg`}
    >
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <h3 className="text-2xl font-black mb-4 uppercase">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
      {desc}
    </p>
    <div className="mt-6 flex items-center gap-2 text-blue-600 font-black text-sm uppercase cursor-pointer">
      View Details <ArrowUpRight size={16} />
    </div>
  </div>
);

export default ZobsCampusAmbassador;
