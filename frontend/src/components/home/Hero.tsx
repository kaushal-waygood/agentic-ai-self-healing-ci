'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  Play,
  Star,
  Briefcase,
  Clock,
  Award,
  Send,
  Eye,
  Heart,
  MessageCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [animatingJobs, setAnimatingJobs] = useState([]);
  const router = useRouter();

  const stats = [
    { number: '500K+', label: 'Applications Sent', icon: Target },
    { number: '15K+', label: 'Jobs Landed', icon: TrendingUp },
    { number: '98%', label: 'Success Rate', icon: CheckCircle },
    { number: '24/7', label: 'Auto Apply', icon: Zap },
  ];

  const features = [
    'AI-Powered CV Optimization',
    'Smart Cover Letter Generation',
    'Automated Job Applications',
    'Real-time Job Matching',
  ];

  const jobCards = [
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

  useEffect(() => {
    setIsVisible(true);

    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (!isTouchDevice) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cardInterval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % jobCards.length);
    }, 4000);
    return () => clearInterval(cardInterval);
  }, []);

  useEffect(() => {
    const jobInterval = setInterval(() => {
      const newJob = {
        id: Date.now(),
        company: ['Apple', 'Netflix', 'Spotify', 'Airbnb', 'Uber'][
          Math.floor(Math.random() * 5)
        ],
        position: ['Developer', 'Engineer', 'Designer', 'Manager'][
          Math.floor(Math.random() * 4)
        ],
      };

      setAnimatingJobs((prev) => [...prev.slice(-2), newJob]);
    }, 3000);

    return () => clearInterval(jobInterval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute w-96 h-96 sm:w-[500px] sm:h-[500px] bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse transition-all duration-1000"
          style={{
            left: `${15 + mousePosition.x * 0.03}%`,
            top: `${5 + mousePosition.y * 0.03}%`,
            transform: `translate(-50%, -50%)`,
          }}
        />
        <div
          className="absolute w-80 h-80 sm:w-[400px] sm:h-[400px] bg-gradient-to-br from-cyan-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse transition-all duration-1000"
          style={{
            right: `${10 + mousePosition.x * 0.02}%`,
            bottom: `${10 + mousePosition.y * 0.02}%`,
            transform: `translate(50%, 50%)`,
            animationDelay: '1.5s',
          }}
        />
        <div
          className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-pink-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse transition-all duration-1000"
          style={{
            left: `${60 + mousePosition.x * 0.01}%`,
            top: `${70 + mousePosition.y * 0.01}%`,
            transform: `translate(-50%, -50%)`,
            animationDelay: '2.5s',
          }}
        />
      </div>

      {/* Main Content with Increased Spacing */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 relative z-10 pb-20 sm:pt-10 sm:pb-24 lg:pt-5">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 xl:gap-24 items-center">
          {/* Left Content with Enhanced Spacing */}
          <div
            className={`space-y-12 lg:space-y-14 text-center lg:text-left transition-all duration-1000 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="space-y-8">
              <h1 className="text-5xl sm:text-6xl  lg:text-6xl  font-extrabold leading-[1.1] tracking-wide">
                <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x mb-2 pb-2">
                  Start Applying
                </span>
                <span className=" text-gray-900">with </span>
                <span className=" bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x mb-2">
                  ZobsAI{' '}
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
                ZobsAI automatically tailors your CV, writes personalized cover
                letters, and applies to{' '}
                <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                  hundreds of jobs daily
                </span>
                .
              </p>
            </div>

            <div
              className={`relative mt-16 lg:mt-0 transition-all duration-1000 delay-500 lg:hidden ${
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-12'
              }`}
            >
              {/* Main Interactive Job Flow */}
              <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse" />
                    <div
                      className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"
                      style={{ animationDelay: '0.5s' }}
                    />
                    <div
                      className="w-4 h-4 bg-green-400 rounded-full animate-pulse"
                      style={{ animationDelay: '1s' }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 font-mono bg-white/50 px-3 py-1 rounded-lg">
                    ZobsAI Dashboard
                  </div>
                </div>

                {/* Live Stats Counter */}
                <div className="text-center mb-8">
                  <p className="text-lg text-gray-600 font-semibold mb-3">
                    {stats[currentStat].label}
                  </p>
                  <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-500 mb-2">
                    {stats[currentStat].number}
                  </div>
                  <div className="flex justify-center">
                    {/* <stats[currentStat].icon className="w-8 h-8 text-purple-500" /> */}
                  </div>
                </div>

                {/* Interactive Job Cards Stack */}
                <div className="relative h-64 mb-8">
                  {jobCards.map((job, index) => (
                    <div
                      key={job.id}
                      className={`absolute inset-x-0 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/60 transition-all duration-700 cursor-pointer hover:scale-105`}
                      style={{
                        zIndex: jobCards.length - Math.abs(index - activeCard),
                        transform: `translateY(${
                          ((index - activeCard + jobCards.length) %
                            jobCards.length) *
                          16
                        }px) scale(${
                          1 -
                          ((index - activeCard + jobCards.length) %
                            jobCards.length) *
                            0.05
                        })`,
                        opacity: `${
                          1 -
                          ((index - activeCard + jobCards.length) %
                            jobCards.length) *
                            0.2
                        }`,
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
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Match Score
                          </span>
                          <span className="text-sm font-bold text-purple-600">
                            {job.match}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${job.match}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              job.status === 'applied'
                                ? 'bg-blue-100 text-blue-700'
                                : job.status === 'reviewing'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {job.status.charAt(0).toUpperCase() +
                              job.status.slice(1)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {job.timeAgo}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Action Cards */}
              <div className="absolute -top-6 -right-6 bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/60 animate-float">
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
                className="absolute -bottom-8 -left-8 bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/60 animate-float"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-100 cursor-pointer group animate-fade-in hover:bg-white/80`}
                  style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
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

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[
                    '/avatar-1.jpg',
                    '/avatar-2.jpg',
                    '/avatar-1.jpg',
                    '/avatar-2.jpg',
                  ].map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      width={48}
                      height={48}
                      alt={`User avatar ${i + 1}`}
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

            <div className="flex flex-col sm:flex-row gap-6 max-w-lg mx-auto lg:max-w-none lg:mx-0">
              <Button
                onClick={() => router.push('/signup')}
                className="w-full sm:flex-1 group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white px-10 py-8 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-3 text-xl">
                  Start Free Trial
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>

          {/* New Interactive Right Side Design */}
          <div
            className={`relative mt-16 lg:mt-0 transition-all duration-1000 delay-500 lg:block hidden ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Main Interactive Job Flow */}
            <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse" />
                  <div
                    className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <div
                    className="w-4 h-4 bg-green-400 rounded-full animate-pulse"
                    style={{ animationDelay: '1s' }}
                  />
                </div>
                <div className="text-sm text-gray-500 font-mono bg-white/50 px-3 py-1 rounded-lg">
                  ZobsAI Dashboard
                </div>
              </div>

              {/* Live Stats Counter */}
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 font-semibold mb-3">
                  {stats[currentStat].label}
                </p>
                <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-500 mb-2">
                  {stats[currentStat].number}
                </div>
                <div className="flex justify-center">
                  {/* <stats[currentStat].icon className="w-8 h-8 text-purple-500" /> */}
                </div>
              </div>

              {/* Interactive Job Cards Stack */}
              <div className="relative h-64 mb-8">
                {jobCards.map((job, index) => (
                  <div
                    key={job.id}
                    className={`absolute inset-x-0 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/60 transition-all duration-700 cursor-pointer hover:scale-105`}
                    style={{
                      zIndex: jobCards.length - Math.abs(index - activeCard),
                      transform: `translateY(${
                        ((index - activeCard + jobCards.length) %
                          jobCards.length) *
                        16
                      }px) scale(${
                        1 -
                        ((index - activeCard + jobCards.length) %
                          jobCards.length) *
                          0.05
                      })`,
                      opacity: `${
                        1 -
                        ((index - activeCard + jobCards.length) %
                          jobCards.length) *
                          0.2
                      }`,
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Match Score
                        </span>
                        <span className="text-sm font-bold text-purple-600">
                          {job.match}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${job.match}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            job.status === 'applied'
                              ? 'bg-blue-100 text-blue-700'
                              : job.status === 'reviewing'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {job.status.charAt(0).toUpperCase() +
                            job.status.slice(1)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {job.timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Action Cards */}
            <div className="absolute -top-6 -right-6 bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/60 animate-float">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-bold text-sm">Interview Scheduled!</p>
                  <p className="text-xs text-gray-600">Google - Tomorrow 2PM</p>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-8 -left-8 bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/60 animate-float"
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

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
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
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(-5px) rotate(-1deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
};
