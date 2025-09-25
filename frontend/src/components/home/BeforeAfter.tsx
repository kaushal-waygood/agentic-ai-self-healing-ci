'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import { beforeStats, afterStats } from './data/solution';
import { useRouter } from 'next/navigation';
const beforeStats = [
  { icon: Clock, text: 'Hours spent customizing resumes' },
  { icon: ArrowRight, text: 'Manual job searching' },
  { icon: Zap, text: 'Low ATS pass rates' },
  { icon: Sparkles, text: 'No response from recruiters' },
];

const afterStats = [
  { icon: Clock, text: 'Minutes spent customizing resumes' },
  { icon: ArrowRight, text: 'Automated job discovery' },
  { icon: Zap, text: 'High ATS pass rates' },
  { icon: Sparkles, text: 'Consistent recruiter responses' },
];

export default function BeforeAfter() {
  const [activeTab, setActiveTab] = useState('before');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);

  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const StatCard = ({ stat, index, type }) => (
    <div
      className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
        type === 'before'
          ? 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:shadow-lg hover:shadow-red-200/50'
          : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 hover:shadow-lg hover:shadow-emerald-200/50'
      }`}
      style={{
        animationDelay: `${index * 150}ms`,
        transform: isVisible
          ? 'translateY(0) scale(1)'
          : 'translateY(20px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
      }}
      onMouseEnter={() => setHoveredStat(`${type}-${index}`)}
      onMouseLeave={() => setHoveredStat(null)}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div
          className={`p-2 rounded-lg transition-all duration-300 ${
            type === 'before'
              ? 'bg-red-500 text-white group-hover:bg-red-600'
              : 'bg-emerald-500 text-white group-hover:bg-emerald-600'
          }`}
        >
          <stat.icon className="w-5 h-5" />
        </div>
        <span
          className={`text-base font-medium transition-colors duration-300 ${
            type === 'before'
              ? 'text-red-700 group-hover:text-red-800'
              : 'text-emerald-700 group-hover:text-emerald-800'
          }`}
        >
          {stat.text}
        </span>
      </div>

      {/* Animated background effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
          type === 'before'
            ? 'bg-gradient-to-r from-red-400 to-red-600'
            : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
        }`}
      />

      {/* Sparkle effect on hover */}
      {hoveredStat === `${type}-${index}` && (
        <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-400 animate-pulse" />
      )}
    </div>
  );

  return (
    <section className=" bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 md:py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-5 py-2 mb-5 shadow-lg">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-bold text-gray-700 uppercase">
              Transformation story
            </span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-6xl font-black mb-5 leading-tight">
            The{' '}
            <span className="text-transparent bg-gradient-to-r from-red-500 to-red-600 bg-clip-text">
              Before
            </span>{' '}
            vs{' '}
            <span className="text-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text">
              After
            </span>{' '}
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              ZobsAI
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Witness the revolutionary transformation in job search efficiency
            and success rates when you harness the power of AI-driven
            automation.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Before Card */}
          <div
            className={`transition-all duration-700 ${
              activeTab === 'before'
                ? 'scale-100 opacity-100 lg:scale-105'
                : 'scale-95 opacity-60'
            }`}
            onClick={() => setActiveTab('before')}
          >
            <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600" />

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500 rounded-2xl shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-red-600">
                    Before ZobsAI
                  </h3>
                  <p className="text-red-400 font-medium text-base">
                    The Struggle Era
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {beforeStats.map((stat, index) => (
                  <StatCard
                    key={index}
                    stat={stat}
                    index={index}
                    type="before"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* After Card */}
          <div
            className={`transition-all duration-700 ${
              activeTab === 'after'
                ? 'scale-100 opacity-100 lg:scale-105'
                : 'scale-95 opacity-60'
            }`}
            onClick={() => setActiveTab('after')}
          >
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-emerald-600">
                    After ZobsAI
                  </h3>
                  <p className="text-emerald-400 font-medium text-base">
                    The Success Era
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {afterStats.map((stat, index) => (
                  <StatCard
                    key={index}
                    stat={stat}
                    index={index}
                    type="after"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 p-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 rounded-3xl shadow-2xl text-white">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2">
                Ready to Start Your Journey?
              </h3>
              <p className="text-white/90">
                Join thousands of students who achieved their dreams
              </p>
            </div>
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
