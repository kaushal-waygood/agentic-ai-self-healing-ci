'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Play,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-purple-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${20 + mousePosition.x * 0.02}%`,
            top: `${10 + mousePosition.y * 0.02}%`,
            transform: `translate(-50%, -50%)`,
          }}
        />
        <div
          className="absolute w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            right: `${15 + mousePosition.x * 0.015}%`,
            bottom: `${15 + mousePosition.y * 0.015}%`,
            transform: `translate(50%, 50%)`,
            animationDelay: '1s',
          }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="relative">
                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                <div className="absolute inset-0 bg-purple-400 rounded-full blur animate-ping opacity-20" />
              </div>
              <span className="text-purple-700 font-semibold">
                AI-Powered Job Applications
              </span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-gray-900">Land Your</span>
                <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
                  Dream Job
                </span>
                <span className="block text-gray-900">with AI Autopilot</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                ZobsAI automatically tailors your CV, writes personalized cover
                letters, and applies to{' '}
                <span className="font-semibold text-purple-600">
                  hundreds of jobs daily
                </span>
                . Transform your job search from weeks to hours.
              </p>
            </div>

            {/* Interactive Features List */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/40 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full group-hover:scale-150 transition-transform duration-300" />
                  <span className="text-sm font-medium text-gray-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                variant="outline"
                className="group px-8 py-4 text-lg font-semibold bg-white/40 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 hover:bg-white/60 transition-all duration-300 transform hover:scale-105"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                <Play
                  className={`w-5 h-5 mr-2 transition-transform duration-300 ${
                    isVideoPlaying ? 'rotate-90' : ''
                  }`}
                />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">15,000+</span> professionals
                  hired
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Dashboard Preview */}
          <div className="relative">
            {/* Main Dashboard Card */}
            <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  ZobsAI Dashboard
                </div>
              </div>

              {/* Animated Stats */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {stats[currentStat].number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stats[currentStat].label}
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CV Match Score</span>
                      <span className="text-purple-600 font-semibold">98%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: '98%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Applications Sent Today
                      </span>
                      <span className="text-blue-600 font-semibold">47</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: '75%', animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="space-y-3 pt-4 border-t border-white/20">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Live Activity
                  </div>
                  {[
                    'Applied to Software Engineer at TechCorp',
                    'CV optimized for Data Scientist role',
                    'Cover letter generated for Frontend Dev',
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/20 rounded-lg animate-pulse"
                      style={{ animationDelay: `${index * 0.5}s` }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      <span className="text-xs text-gray-600">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Success Cards */}
            <div className="absolute -top-8 -right-8 bg-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/40 animate-bounce">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Job Matched!</span>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/40 animate-pulse">
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">+12 Applications</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-purple-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};
