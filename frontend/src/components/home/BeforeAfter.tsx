'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import { beforeStats, afterStats } from './data/solution';

// NOTE: I've added sample data for beforeStats and afterStats to make this a runnable example.
// In your project, you'd keep the original import statement.
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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const StatCard = ({ stat, index, type }) => (
    <div
      className={`group relative overflow-hidden rounded-xl p-3 md:p-4 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
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
      <div className="flex items-center gap-2 md:gap-3 relative z-10">
        <div
          className={`p-2 rounded-lg transition-all duration-300 ${
            type === 'before'
              ? 'bg-red-500 text-white group-hover:bg-red-600'
              : 'bg-emerald-500 text-white group-hover:bg-emerald-600'
          }`}
        >
          <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <span
          className={`text-sm md:text-base font-medium transition-colors duration-300 ${
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
        <Sparkles className="absolute top-2 right-2 w-3 h-3 md:w-4 md:h-4 text-yellow-400 animate-pulse" />
      )}
    </div>
  );

  const ResultCard = ({ value, label, delay, gradient }) => (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group ${gradient}`}
      style={{
        animationDelay: `${delay}ms`,
        transform: isVisible
          ? 'translateY(0) scale(1)'
          : 'translateY(30px) scale(0.9)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="relative z-10">
        <div className="text-4xl md:text-5xl font-black mb-2 md:mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300">
          {value}
        </div>
        <div className="text-gray-600 font-medium text-sm md:text-lg">
          {label}
        </div>
      </div>

      {/* Animated background blob */}
      <div className="absolute -top-4 -right-4 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
    </div>
  );

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-16 md:py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-10 md:top-20 left-5 md:left-10 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 md:px-6 md:py-2 mb-4 md:mb-6 shadow-lg">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            <span className="text-xs md:text-sm font-medium text-gray-700">
              Transformation Story
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 leading-tight">
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

          <p className="text-base md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Witness the revolutionary transformation in job search efficiency
            and success rates when you harness the power of AI-driven
            automation.
          </p>
        </div>

        {/* Interactive Toggle */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200 w-full max-w-sm md:max-w-md mx-auto">
            <div
              className={`absolute top-2 h-10 md:h-12 bg-gradient-to-r rounded-xl transition-all duration-500 ease-out ${
                activeTab === 'before'
                  ? 'left-2 w-[calc(50%-8px)] from-red-500 to-red-600'
                  : 'left-[calc(50%+4px)] w-[calc(50%-8px)] from-emerald-500 to-emerald-600'
              }`}
            />
            <button
              onClick={() => setActiveTab('before')}
              className={`relative z-10 w-1/2 py-2 md:py-3 rounded-xl font-semibold transition-colors duration-300 ${
                activeTab === 'before'
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`relative z-10 w-1/2 py-2 md:py-3 rounded-xl font-semibold transition-colors duration-300 ${
                activeTab === 'after'
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              After
            </button>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20">
          {/* Before Card */}
          <div
            className={`transition-all duration-700 ${
              activeTab === 'before'
                ? 'scale-100 opacity-100 lg:scale-105'
                : 'scale-95 opacity-60'
            }`}
          >
            <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600" />

              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="p-2 md:p-3 bg-red-500 rounded-2xl shadow-lg">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-bold text-red-600">
                    Before ZobsAI
                  </h3>
                  <p className="text-red-400 font-medium text-sm md:text-base">
                    The Struggle Era
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
          >
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />

              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="p-2 md:p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-bold text-emerald-600">
                    After ZobsAI
                  </h3>
                  <p className="text-emerald-400 font-medium text-sm md:text-base">
                    The Success Era
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
