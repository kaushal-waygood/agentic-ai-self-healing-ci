'use client';

import {
  Brain,
  FileText,
  Send,
  BarChart3,
  Globe,
  Target,
  Play,
  Pause,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const solutions = [
  {
    icon: Brain,
    title: 'AI-Powered Resume',
    stat: '90% Match',
    description:
      'Our AI analyzes job descriptions and customizes your resume to get past ATS filters.',
    features: [
      'Keyword optimization',
      'Action verb suggestions',
      'ATS score analysis',
    ],
    demo: 'See Resume Customization',
    color: 'from-purple-600 to-blue-600',
  },
  {
    icon: FileText,
    title: 'Instant Cover Letters',
    stat: '85% Faster',
    description:
      'Generate a personalized cover letter for any job in seconds, tailored to your skills.',
    features: [
      'Personalized content',
      'Tone adjustments',
      'Multi-format export',
    ],
    demo: 'See Cover Letter Demo',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    icon: Send,
    title: 'Automated Job Applications',
    stat: '4X Applications',
    description:
      'Apply to multiple jobs at once with one click, without filling out repetitive forms.',
    features: [
      'Automatic form filling',
      'Application tracking',
      'Smart scheduling',
    ],
    demo: 'See Job Apply Demo',
    color: 'from-cyan-600 to-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    stat: '60% More Effective',
    description:
      'Track your application success rates and get insights into your resume performance.',
    features: [
      'Interview success rate',
      'Resume views tracker',
      'Keyword performance',
    ],
    demo: 'See Analytics Dashboard',
    color: 'from-emerald-600 to-green-600',
  },
];

export const Solutions = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeDemo, setActiveDemo] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % solutions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleCardClick = (index: number) => {
    setActiveDemo(index);
    if (isMobile) {
      setHoveredCard(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!isMobile) {
      setHoveredCard(index);
      setActiveDemo(index); // Also set active demo on hover for desktop
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredCard(null);
    }
  };

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/50 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${15 + mousePosition.x * 0.02}%`,
            top: `${10 + mousePosition.y * 0.02}%`,
          }}
        />
        <div
          className="absolute w-80 h-80 bg-gradient-to-br from-cyan-400/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse"
          style={{
            right: `${20 + mousePosition.x * 0.015}%`,
            bottom: `${15 + mousePosition.y * 0.015}%`,
            animationDelay: '2s',
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100/50 backdrop-blur-sm border border-green-200/50 rounded-full mb-8">
            <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-green-700 font-semibold text-base">
              AI-Powered Solutions
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="text-gray-900">Meet Your</span>
            <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Job Search Assistant
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ZobsAI transforms your job search with AI, turning the tedious
            process into an automated success machine.
          </p>
        </div>

        {/* Main Content Grid - Updated for 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            const isActive = activeDemo === index;

            return (
              <div
                key={index}
                className={`relative group cursor-pointer transform transition-all duration-300 ${
                  isActive ? 'scale-105 z-20' : 'z-10'
                }`}
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Background Glow */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${
                    solution.color
                  } rounded-xl blur-lg opacity-0 transition-all duration-300 ${
                    isActive ? 'opacity-30' : 'group-hover:opacity-20'
                  }`}
                />

                {/* Main Card */}
                <div
                  className={`relative bg-white/70 backdrop-blur-xl border rounded-xl p-5 shadow-lg transition-all duration-300 h-full ${
                    isActive
                      ? 'border-purple-300'
                      : 'border-white/50 group-hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${
                        solution.color
                      } rounded-lg flex items-center justify-center shadow-md transform transition-all duration-300 flex-shrink-0 ${
                        isActive
                          ? 'scale-110 rotate-3'
                          : 'group-hover:scale-105'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                        {solution.title}
                      </h3>
                      <div
                        className={`px-2 py-0.5 mb-2 inline-block bg-gradient-to-r ${solution.color} rounded-full text-white text-xs font-bold`}
                      >
                        {solution.stat}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 my-3 leading-relaxed">
                    {solution.description}
                  </p>

                  {/* Features List & Demo Link Container */}
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      isActive
                        ? 'max-h-40 opacity-100 mt-3'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-1.5 mb-3">
                      {solution.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/login"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100/50 rounded-full text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>{solution.demo}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
