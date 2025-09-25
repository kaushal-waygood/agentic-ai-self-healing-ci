'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Zap,
  Play,
  Rocket,
  User,
  Sparkles,
  CheckCircle,
  TrendingUp,
  FileText,
  ArrowRight,
  Star,
  Clock,
  Brain,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Data for the steps with updated, more interactive button text
const steps = [
  {
    step: 1,
    icon: Settings,
    title: 'Profile Setup',
    description:
      'Quickly create your professional profile by uploading your resume. Our AI instantly analyzes your skills and experience.',
    time: '2 mins',
    gradient: 'from-blue-500 to-purple-500',
    lightGradient: 'from-blue-100 to-purple-100',
    color: 'blue',
    successRate: 98,
    button: 'Create Your Profile', // Changed
  },
  {
    step: 2,
    icon: Zap,
    title: 'AI Automation',
    description:
      'Our AI finds jobs that are a perfect fit for your profile, saving you hours of searching on different job boards.',
    time: 'Auto-Run',
    gradient: 'from-purple-500 to-emerald-500',
    lightGradient: 'from-purple-100 to-emerald-100',
    color: 'purple',
    successRate: 94,
    button: 'Discover Jobs', // Changed
  },
  {
    step: 3,
    icon: FileText,
    title: 'Resume Customization',
    description:
      'For every job, ZobsAI customizes your resume to beat the ATS and highlights your relevant skills.',
    time: 'Per Job',
    gradient: 'from-emerald-500 to-cyan-500',
    lightGradient: 'from-emerald-100 to-cyan-100',
    color: 'emerald',
    successRate: 85,
    button: 'Optimize for ATS', // Changed
  },
  {
    step: 4,
    icon: Rocket,
    title: 'Automated Application',
    description:
      'Apply to jobs directly from our platform. Our system fills out forms and submits your tailored resume for you.',
    time: 'Instant',
    gradient: 'from-cyan-500 to-blue-500',
    lightGradient: 'from-cyan-100 to-blue-100',
    color: 'cyan',
    successRate: 92,
    button: 'Launch Auto-Apply', // Changed
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const router = useRouter();

  // Function to start the autoplaying carousel
  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
  };

  // Function to stop the autoplay
  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start autoplay on component mount
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay(); // Cleanup on unmount
  }, []);

  // Update progress bar when activeStep changes
  useEffect(() => {
    setProgress((activeStep + 1) * 25);
  }, [activeStep]);

  // A more focused, reusable card component for each step
  const StepCard = ({ step, index, isActive }) => {
    const IconComponent = step.icon;

    return (
      <div
        className={`group relative cursor-pointer transition-all duration-500 transform h-full ${
          isActive ? 'scale-105 md:scale-110 z-20' : 'hover:scale-105 z-10'
        }`}
        onMouseEnter={() => {
          setActiveStep(index);
          stopAutoPlay();
        }}
        onMouseLeave={() => {
          startAutoPlay();
        }}
      >
        {/* Connection Lines for Desktop */}
        {index < steps.length - 1 && (
          <div className="hidden lg:block absolute top-24 left-full w-full">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${
                  step.gradient
                } transition-all duration-1000 ease-out ${
                  activeStep > index ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          </div>
        )}

        {/* Card Container */}
        <div
          className={`relative bg-white/95 backdrop-blur-xl border-2 rounded-3xl overflow-hidden transition-all duration-500 shadow-xl h-full flex flex-col ${
            isActive
              ? `border-${step.color}-300 shadow-2xl shadow-${step.color}-200/50`
              : `border-transparent group-hover:border-${step.color}-300 group-hover:shadow-xl`
          }`}
        >
          {/* Card Header */}
          <div
            className={`h-28 bg-gradient-to-br ${step.lightGradient} relative overflow-hidden flex-shrink-0`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                step.gradient
              } opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                isActive ? 'opacity-30' : ''
              }`}
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div
                className={`w-16 h-16 bg-gradient-to-r ${
                  step.gradient
                } rounded-3xl flex items-center justify-center shadow-xl border-4 border-white transition-transform duration-300 group-hover:scale-105 ${
                  isActive ? 'animate-bounce scale-110' : ''
                }`}
              >
                <span className="text-white font-black text-xl">
                  {step.step}
                </span>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-white/80 rounded-full shadow border">
              <Star className={`w-3 h-3 text-${step.color}-500 fill-current`} />
              <span className={`text-xs font-bold text-${step.color}-700`}>
                {step.successRate}%
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 pt-12 text-center flex flex-col flex-grow">
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`p-4 bg-white rounded-2xl border-2 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                    isActive
                      ? `scale-110 rotate-6 border-${step.color}-200`
                      : 'border-gray-100'
                  }`}
                >
                  <IconComponent className={`w-7 h-7 text-${step.color}-600`} />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>{step.time}</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Bottom section for hover button OR active indicator */}
            <div className="mt-auto pt-6 min-h-[68px]">
              <div className="hidden group-hover:block animate-fade-in-up">
                <button
                  onClick={() => router.push('/signup')}
                  className={`w-full py-3 bg-gradient-to-r ${step.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2 group/btn`}
                >
                  {step.button}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className=" bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40 py-8 md:py-20 relative overflow-hidden"
      id="how-it-works"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s', animationDirection: 'reverse' }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <header className="text-center mb-20 md:mb-24">
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 mb-8 shadow-md">
            <Brain className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold text-gray-700 uppercase">
              AI Assistant
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-6xl font-black mb-6 tracking-tight">
            Meet your Job{' '}
            <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text animate-gradient">
              AI Assistant
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your job search with AI-powered automation that works
            while you sleep.
          </p>
        </header>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch gap-10">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              isActive={activeStep === index}
            />
          ))}
        </div>
      </div>

      {/* Simplified Styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-fade-in-up,
          .animate-shimmer,
          .animate-gradient,
          .animate-bounce {
            animation: none;
          }
          .transition-all,
          .transition-transform {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
