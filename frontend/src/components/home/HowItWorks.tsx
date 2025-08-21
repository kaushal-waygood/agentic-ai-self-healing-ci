'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Zap,
  ArrowRight,
  Play,
  Rocket,
  Sparkles,
  CheckCircle,
  Clock,
  BarChart3,
  MousePointer,
  Users,
  FileText,
  Target,
  TrendingUp,
  ArrowDown, // Added for vertical flow on mobile
  Download,
  Send,
  Star,
  Globe,
  Shield,
} from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Settings,
    title: 'Profile Setup',
    highlight: '2-Minute Setup',
    description:
      'Quickly create your professional profile by uploading your resume. Our AI instantly analyzes your skills and experience.',
    time: '2 mins',
    stats: '100% Data Accuracy',
    gradient: 'from-blue-500 to-purple-500',
    lightGradient: 'from-blue-100 to-purple-100',
    color: 'blue',
    features: ['Smart Resume Parsing', 'Skill Extraction', 'Industry Matching'],
  },
  {
    step: 2,
    icon: Zap,
    title: 'AI Automation',
    highlight: 'Job Discovery',
    description:
      'Our AI finds jobs that are a perfect fit for your profile, saving you hours of searching on different job boards.',
    time: 'Auto-Run',
    stats: '500+ Jobs Found',
    gradient: 'from-purple-500 to-emerald-500',
    lightGradient: 'from-purple-100 to-emerald-100',
    color: 'purple',
    features: ['Multi-Platform Search', 'Smart Filtering', 'Real-time Updates'],
  },
  {
    step: 3,
    icon: FileText,
    title: 'Resume Customization',
    highlight: 'ATS-Friendly',
    description:
      'For every job, ZobsAI customizes your resume to beat the ATS and highlights your relevant skills.',
    time: 'Per Job',
    stats: '85% ATS Pass Rate',
    gradient: 'from-emerald-500 to-cyan-500',
    lightGradient: 'from-emerald-100 to-cyan-100',
    color: 'emerald',
    features: [
      'Keyword Optimization',
      'Format Adaptation',
      'Skill Highlighting',
    ],
  },
  {
    step: 4,
    icon: Rocket,
    title: 'Automated Application',
    highlight: 'One-Click Apply',
    description:
      'Apply to jobs directly from our platform. Our system fills out forms and submits your tailored resume for you.',
    time: 'Instant',
    stats: '100+ Daily Applies',
    gradient: 'from-cyan-500 to-blue-500',
    lightGradient: 'from-cyan-100 to-blue-100',
    color: 'cyan',
    features: ['Auto Form Fill', 'Cover Letter Gen', 'Follow-up Tracking'],
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProgress((activeStep + 1) * 25);
  }, [activeStep]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const StepCard = ({ step, index, isActive }) => {
    const IconComponent = step.icon;
    const isHovered = hoveredCard === index;

    return (
      <div
        className={`relative group cursor-pointer transition-all duration-700 transform-gpu ${
          isActive ? 'scale-105 md:scale-110 z-20' : 'hover:scale-105 z-10'
        }`}
        style={{
          transform: `translateY(${isVisible ? 0 : 50}px) scale(${
            isActive ? 1.1 : isVisible ? 1 : 0.9
          }) rotateX(${isHovered ? '5deg' : '0deg'})`,
          opacity: isVisible ? (isActive ? 1 : 0.8) : 0,
          transitionDelay: `${index * 150}ms`,
          perspective: '1000px',
        }}
        onMouseEnter={() => {
          setActiveStep(index);
          setHoveredCard(index);
        }}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Horizontal Connecting Line for Desktop */}
        {index < steps.length - 1 && (
          <div className="hidden lg:block absolute top-20 left-full w-full z-0">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full bg-gradient-to-r ${
                  step.gradient
                } transition-all duration-1500 ${
                  activeStep > index ? 'w-full' : 'w-0'
                }`}
              />
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full transition-all duration-1500 ${
                  activeStep > index
                    ? 'left-1/4 opacity-100'
                    : 'left-0 opacity-0'
                }`}
                style={{ animationDelay: '0.3s' }}
              />
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full transition-all duration-1500 ${
                  activeStep > index
                    ? 'left-3/4 opacity-100'
                    : 'left-0 opacity-0'
                }`}
                style={{ animationDelay: '0.6s' }}
              />
            </div>
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r ${
                step.gradient
              } rounded-full transition-all duration-1500 shadow-lg ${
                activeStep > index ? 'left-full -translate-x-4' : 'left-0'
              }`}
            >
              <div className="absolute inset-1 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Vertical Connecting Line for Mobile/Tablet */}
        {index < steps.length - 1 && (
          <div className="block lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-gray-300" />
        )}

        <div
          className={`relative bg-white/90 backdrop-blur-xl border-2 rounded-3xl overflow-hidden transition-all duration-500 ${
            isActive
              ? `border-${step.color}-300 shadow-2xl shadow-${step.color}-200/40`
              : 'border-white/30 shadow-lg hover:shadow-2xl'
          }`}
          style={{
            background: isHovered
              ? `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)`
              : undefined,
          }}
        >
          <div
            className={`h-24 md:h-28 bg-gradient-to-br ${step.lightGradient} relative overflow-hidden`}
            style={{
              background: isHovered
                ? `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`
                : undefined,
            }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                step.gradient
              } opacity-0 ${
                isActive
                  ? 'opacity-30'
                  : isHovered
                  ? 'opacity-20'
                  : 'group-hover:opacity-15'
              } transition-all duration-500`}
            />
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/40 rounded-full animate-float"
                  style={{
                    top: `${20 + i * 10}%`,
                    left: `${15 + i * 8}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div
                className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r ${
                  step.gradient
                } rounded-3xl flex items-center justify-center shadow-xl border-4 border-white ${
                  isActive ? 'animate-bounce' : isHovered ? 'animate-pulse' : ''
                }`}
              >
                <span className="text-white font-black text-lg md:text-xl">
                  {step.step}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 pt-10 md:pt-12">
            <div className="flex items-center justify-between mb-6">
              <div
                className={`p-3 md:p-4 bg-gradient-to-br ${
                  step.lightGradient
                } rounded-2xl border-2 border-${
                  step.color
                }-200 group-hover:scale-110 ${
                  isActive ? 'scale-110 rotate-3' : ''
                } transition-all duration-300 shadow-lg`}
              >
                <IconComponent
                  className={`w-6 h-6 md:w-7 md:h-7 text-${step.color}-600`}
                />
              </div>
              <div
                className={`px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r ${step.gradient} text-white text-xs md:text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {step.time}
              </div>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-gray-800">
                {step.title}
              </h3>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r ${step.lightGradient} rounded-full mb-4 shadow-sm border border-${step.color}-200`}
              >
                <Sparkles
                  className={`w-4 h-4 text-${step.color}-500 animate-pulse`}
                />
                <span
                  className={`text-sm md:text-base font-semibold text-${step.color}-700`}
                >
                  {step.highlight}
                </span>
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 md:mb-5">
                {step.description}
              </p>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 bg-white border-2 border-${step.color}-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <BarChart3
                  className={`w-4 h-4 md:w-5 md:h-5 text-${step.color}-500`}
                />
                <span
                  className={`text-sm md:text-base font-bold text-${step.color}-700`}
                >
                  {step.stats}
                </span>
              </div>
            </div>
            {isHovered && (
              <div className="space-y-2 mb-4 animate-fade-in-up">
                {step.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div
                      className={`w-2 h-2 bg-gradient-to-r ${step.gradient} rounded-full`}
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}
            {isActive && (
              <div className="space-y-3 animate-fade-in-up">
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 animate-bounce" />
                  <span>Step completed automatically</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${step.gradient} rounded-full transition-all duration-2000 relative overflow-hidden`}
                    style={{ width: '100%' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
          />
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-16 md:py-24 relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f3e8ff 100%)`,
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float opacity-60" />
        <div
          className="absolute bottom-32 right-20 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float opacity-60"
          style={{ animationDelay: '2s', animationDirection: 'reverse' }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[600px] bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '8s' }}
        />
      </div>
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-8 shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-700 text-base sm:text-lg">
              How It Works
            </span>
            <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
          </div>
          {/* Modified font sizes for responsiveness */}
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
            How{' '}
            <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text animate-gradient">
              ZobsAI
            </span>{' '}
            <span className="text-gray-900">Works</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-10">
            Transform your job search with AI-powered automation that works
            while you sleep
          </p>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-500">
                Progress
              </span>
              <span className="text-sm font-bold text-blue-600">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner relative">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-1000"
                style={{ left: `${Math.max(0, progress - 2)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modified grid layout and gap for responsiveness */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-8 mb-16 md:mb-24">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              isActive={activeStep === index}
            />
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-10 shadow-2xl mb-16 md:mb-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-10 text-gray-900">
            The Complete Automation Flow
          </h3>
          {/* Modified grid layout for responsiveness */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                icon: MousePointer,
                text: 'You Upload',
                color: 'blue',
                desc: 'Resume & Preferences',
              },
              {
                icon: Settings,
                text: 'AI Optimizes',
                color: 'purple',
                desc: 'Profile & Targeting',
              },
              {
                icon: Zap,
                text: 'Auto Applies',
                color: 'emerald',
                desc: 'Hundreds of Jobs',
              },
              {
                icon: Users,
                text: 'You Interview',
                color: 'orange',
                desc: 'Land Your Dream Job',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center group hover:scale-110 transition-all duration-500 cursor-pointer"
              >
                <div
                  className={`w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl group-hover:rotate-6 group-hover:shadow-2xl transition-all duration-500 mx-auto`}
                >
                  <item.icon className="w-7 h-7 md:w-10 md:h-10 text-white" />
                </div>
                <p className="font-bold text-base md:text-lg text-gray-800 mb-2">
                  {item.text}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                {/* Horizontal arrow for tablet+ */}
                {index < 3 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mt-4 hidden sm:block animate-pulse" />
                )}
                {/* Vertical arrow for mobile */}
                {index < 3 && index % 2 === 0 && (
                  <ArrowDown className="w-6 h-6 text-gray-400 mx-auto mt-4 sm:hidden animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl text-white mb-16 md:mb-24 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl animate-float" />
            <div
              className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/30 rounded-full blur-2xl animate-float"
              style={{ animationDelay: '1s', animationDirection: 'reverse' }}
            />
            <div
              className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl animate-pulse"
              style={{ animationDuration: '3s' }}
            />
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Target className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                See It In Action
              </h3>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              Watch how ZobsAI transforms your job search from manual drudgery
              to automated success with real results.
            </p>
            {/* This grid is already responsive with sm: prefix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
              {[
                {
                  number: '10,000+',
                  label: 'Jobs Applied To',
                  icon: Target,
                  color: 'emerald',
                },
                {
                  number: '15x',
                  label: 'Higher Response Rate',
                  icon: TrendingUp,
                  color: 'blue',
                },
                {
                  number: '2 mins',
                  label: 'Setup Time',
                  icon: Clock,
                  color: 'purple',
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-110 transition-all duration-500 cursor-pointer"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-${stat.color}-400/20 to-${stat.color}-600/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:bg-white/30 transition-all duration-300`}
                  >
                    <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
            {/* This flex layout is already responsive */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-emerald-300/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                <Play className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
                Watch Demo
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
              </button>
              <button className="group border-2 border-white/40 hover:border-white/70 text-white hover:bg-white/10 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold text-base sm:text-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3">
                Start Free Trial
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div
            className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 max-w-5xl mx-auto relative overflow-hidden group"
            style={{
              transform: isVisible
                ? 'translateY(0) rotateX(0deg)'
                : 'translateY(50px) rotateX(10deg)',
              opacity: isVisible ? 1 : 0,
              transitionDelay: '1200ms',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl group-hover:rotate-12 transition-transform duration-500">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Ready to Transform Your Job Search?
                </h3>
              </div>
              <p className="text-base md:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                Join thousands of professionals who have automated their way to
                better careers with AI-powered job applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 sm:px-12 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                  <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  Start Free Trial
                  <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
                </button>
                <button className="group border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-8 py-3 sm:px-12 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3">
                  Schedule Demo
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No changes needed for the style block */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(2deg);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
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
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .glass {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .card-hover:hover {
          transform: translateY(-8px) rotateX(5deg);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        html {
          scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
        }
      `}</style>
    </section>
  );
}
