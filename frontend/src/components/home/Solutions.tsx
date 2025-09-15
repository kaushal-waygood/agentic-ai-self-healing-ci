'use client';

import { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  FileCheck,
  Search,
  DollarSign,
  Plane,
  CheckCircle,
  Clock,
  ArrowRight,
  Brain,
  FileText,
  Send,
  BarChart3,
} from 'lucide-react';

const journeySteps = [
  {
    id: 1,
    title: 'AI-Powered Job Matches',
    icon: Brain,
    description:
      'Our AI analyzes job descriptions and customizes your resume to get past ATS filters and land you more interviews.',
    color: 'from-pink-400 to-rose-400',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    position: 'left',
    status: '90% Match',
    demo: 'Start Matching',
  },
  {
    id: 2,
    title: 'AI-Powered Resume',
    icon: Brain,
    description:
      'Our AI analyzes job descriptions and customizes your resume to get past ATS filters and land you more interviews.',
    color: 'from-pink-400 to-rose-400',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    position: 'right',
    status: '90% Match',
    demo: 'Try Resume AI',
  },
  {
    id: 3,
    title: 'Instant Cover Letters',
    icon: FileText,
    description:
      'Generate a personalized cover letter for any job in seconds, tailored to highlight your most relevant skills and experience.',
    color: 'from-amber-400 to-yellow-400',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    position: 'left',
    status: '85% Faster',
    demo: 'Try Cover Letter AI',
  },
  {
    id: 4,
    title: 'Auto Job Applications',
    icon: Send,
    description:
      'Document preparation, essay writing, and application submission guidance',
    color: 'from-yellow-400 to-lime-400',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    position: 'right',
    status: 'upcoming',
    demo: 'Watch Auto-Apply',
  },
  {
    id: 5,
    title: 'Smart Analytics',
    icon: BarChart3,
    description:
      'Track your application success rates, get insights into your resume performance, and optimize your strategy with data.',
    color: 'from-lime-400 to-green-400',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    position: 'left',
    status: '60% Better Results',
    demo: 'Try Cover Letter AI',
  },
];

export function Solutions() {
  const [activeStep, setActiveStep] = useState(2);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (step) => {
    if (step.status === 'completed') return CheckCircle;
    if (step.status === 'active') return Clock;
    return step.icon;
  };

  const getStatusColor = (step) => {
    if (step.status === 'completed') return 'text-green-500';
    if (step.status === 'active') return 'text-orange-500';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-amber-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-green-400/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-lg border border-blue-200/50 rounded-full mb-8 shadow-lg">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-bold">
              AI-Powered Solutions{' '}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span className="text-gray-900">Meet Your</span>{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Job Search Assistant{' '}
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Follow our comprehensive 6-step process to ensure that you achieve
            success in your study abroad journey
          </p>
        </div>

        {/* Journey Steps */}
        <div className="relative">
          {/* Central Timeline */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 rounded-full" />

          <div className="space-y-12">
            {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              const StatusIconComponent = getStatusIcon(step);
              const isLeft = step.position === 'left';
              const isActive = activeStep === step.id;
              const isHovered = hoveredStep === step.id;
              const isCompleted = step.status === 'completed';

              return (
                <div
                  key={step.id}
                  className="relative flex items-center justify-center"
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Step Number Circle */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                    <div
                      className={`w-16 h-16 rounded-full border-4 border-white shadow-xl transition-all duration-500 cursor-pointer transform ${
                        isActive || isHovered ? 'scale-110' : 'scale-100'
                      } ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : isActive
                          ? `bg-gradient-to-br ${step.color}`
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveStep(step.id)}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <span
                          className={`text-2xl font-black transition-colors duration-300 ${
                            isCompleted
                              ? 'text-white'
                              : isActive
                              ? 'text-white'
                              : 'text-gray-600'
                          }`}
                        >
                          {step.id}
                        </span>
                      </div>

                      {/* Pulse Effect for Active Step */}
                      {isActive && (
                        <div
                          className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-30 animate-ping`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Step Content Card */}
                  <div
                    className={`w-full max-w-md transition-all duration-500 transform cursor-pointer ${
                      isLeft ? 'mr-auto pr-24' : 'ml-auto pl-24'
                    } ${isActive || isHovered ? 'scale-105' : 'scale-100'}`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <div
                      className={`relative p-8 rounded-3xl border-2 transition-all duration-500 backdrop-blur-lg ${
                        isActive
                          ? `${step.bgColor} ${step.borderColor} shadow-2xl`
                          : 'bg-white/70 border-white/50 shadow-lg hover:shadow-xl'
                      } ${isHovered ? 'shadow-2xl border-gray-300' : ''}`}
                    >
                      {/* Background Gradient Effect */}
                      <div
                        className={`absolute inset-0 rounded-3xl opacity-0 transition-all duration-500 ${
                          isActive || isHovered ? 'opacity-10' : ''
                        } bg-gradient-to-br ${step.color} blur-xl`}
                      />

                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={`p-3 rounded-2xl transition-all duration-500 ${
                              isActive
                                ? `bg-gradient-to-br ${step.color} shadow-lg`
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <IconComponent
                              className={`w-6 h-6 transition-colors duration-300 ${
                                isActive ? 'text-white' : 'text-gray-600'
                              }`}
                            />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                              {step.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <StatusIconComponent
                                className={`w-4 h-4 ${getStatusColor(step)}`}
                              />
                              <span
                                className={`capitalize font-medium ${getStatusColor(
                                  step,
                                )}`}
                              >
                                {step.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {step.description}
                        </p>

                        {/* Action Button */}
                        <div className="animate-fadeIn">
                          <button
                            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${step.color} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
                          >
                            <span>{step.demo}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-100'
                            : 'scale-0'
                        } flex items-center justify-center`}
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Connection Line to Timeline */}
                  <div
                    className={`absolute top-8 w-20 h-0.5 bg-gradient-to-r transition-all duration-500 ${
                      isActive
                        ? step.color
                            .replace('from-', 'from-')
                            .replace('to-', 'to-')
                        : 'from-gray-200 to-gray-300'
                    } ${isLeft ? 'right-1/2 mr-8' : 'left-1/2 ml-8'}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
