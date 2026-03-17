'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const STATS = [
  { number: '500K+', label: 'Applications Sent', icon: Target },
  { number: '15K+', label: 'Jobs Landed', icon: TrendingUp },
  { number: '98%', label: 'Success Rate', icon: CheckCircle },
  { number: '24/7', label: 'Auto Apply', icon: Zap },
];

const FEATURES = [
  'AI-Powered CV Optimization',
  'Smart Cover Letter Generation',
  'Automated Job Applications',
  'Real-time Job Matching',
];

const JOB_CARDS = [
  {
    id: 1,
    company: 'Google',
    position: 'Senior Frontend Developer',
    salary: '$120k - $180k',
    match: 98,
    status: 'applied',
    timeAgo: '2 min ago',
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 2,
    company: 'Microsoft',
    position: 'Full Stack Engineer',
    salary: '$110k - $160k',
    match: 95,
    status: 'reviewing',
    timeAgo: '5 min ago',
    color: 'from-green-500 to-blue-600',
  },
  {
    id: 3,
    company: 'Meta',
    position: 'React Developer',
    salary: '$130k - $190k',
    match: 92,
    status: 'matched',
    timeAgo: '8 min ago',
    color: 'from-purple-500 to-pink-600',
  },
];

const AVATARS = [
  '/avatars/avatar-1.jpg',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.jpg',
  '/avatars/avatar-5.png',
];

export const Hero = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [activeCard, setActiveCard] = useState(0);
  const router = useRouter();

  // Optimized Intervals
  useEffect(() => {
    const statInterval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % STATS.length);
    }, 3000);

    const cardInterval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % JOB_CARDS.length);
    }, 4000);

    return () => {
      clearInterval(statInterval);
      clearInterval(cardInterval);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 relative z-10 pb-20 sm:pt-10 sm:pb-24 lg:pt-5">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 xl:gap-24 items-center">
          {/* Left Content */}
          <div className="space-y-12 lg:space-y-14 text-center lg:text-left">
            <div className="space-y-8">
              <h1 className="text-5xl sm:text-6xl lg:text-6xl font-extrabold leading-[1.1] tracking-wide">
                <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x mb-2 pb-2">
                  Start Applying
                </span>
                <span className="text-gray-900">with </span>
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x mb-2">
                  ZobsAI
                </span>
              </h1>
              <p className="text-lg sm:text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-normal">
                ZobsAI automatically tailors your CV, writes personalized cover
                letters, and applies to{' '}
                <span className="font-normal text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                  hundreds of jobs daily.
                </span>
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/80 shadow-lg  group"
                >
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-semibold text-gray-800">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {AVATARS.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt="User"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                    />
                  ))}
                </div>
                <div className="text-base text-gray-600">
                  <span className="font-bold text-xl text-gray-900">
                    15,000+
                  </span>
                  <br />
                  <span className="text-sm">professionals hired</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-6 max-w-lg mx-auto lg:max-w-none lg:mx-0">
              <Button
                onClick={() => router.push('/signup')}
                className="w-full sm:flex-1 group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white px-10 py-8 text-lg font-bold  transition-all duration-300 rounded-2xl"
              >
                <span className="relative flex items-center justify-center gap-3 text-xl">
                  Start Free Trial
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>

          {/* Right Side - Dashboard Preview (Static Display) */}
          <div className="relative lg:block hidden">
            <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-2xl group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-400 rounded-full" />
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                  <div className="w-4 h-4 bg-green-400 rounded-full" />
                </div>
                <div className="text-sm text-gray-500 font-mono bg-white/50 px-3 py-1 rounded-lg">
                  ZobsAI Dashboard
                </div>
              </div>

              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 font-semibold mb-3">
                  {STATS[currentStat].label}
                </p>
                <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {STATS[currentStat].number}
                </div>
              </div>

              {/* Job Cards Stack */}
              <div className="relative h-64 mb-8">
                {JOB_CARDS.map((job, index) => {
                  const offset =
                    (index - activeCard + JOB_CARDS.length) % JOB_CARDS.length;
                  return (
                    <div
                      key={job.id}
                      className="absolute inset-x-0 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/60 transition-all duration-700"
                      style={{
                        zIndex: JOB_CARDS.length - offset,
                        transform: `translateY(${offset * 16}px) scale(${1 - offset * 0.05})`,
                        opacity: 1 - offset * 0.2,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {job.position}
                          </h3>
                          <p className="text-gray-600 font-medium">
                            {job.company}
                          </p>
                          <p className="text-green-600 font-bold text-lg mt-2">
                            {job.salary}
                          </p>
                        </div>
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${job.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                        >
                          {job.company[0]}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                            style={{ width: `${job.match}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {job.status}
                          </div>
                          <span className="text-xs text-gray-500">
                            {job.timeAgo}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute -buttom-6 -left-6 bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/60 animate-float">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-bold text-sm">Interview Scheduled!</p>
                    <p className="text-xs text-gray-600">
                      Google - Tomorrow 2PM
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-8 -right-8 bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/60 animate-float"
                style={{ animationDelay: '2s' }}
              >
                <div className="flex items-center gap-3 text-purple-600">
                  <Briefcase className="w-5 h-5" />
                  <div>
                    <p className="font-bold text-sm">+23 New Matches</p>
                    <p className="text-xs text-gray-600">In the last hour</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
