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
      'Our AI analyzes job descriptions and customizes your resume to get past ATS filters and land you more interviews.',
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
      'Generate a personalized cover letter for any job in seconds, tailored to highlight your most relevant skills and experience.',
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
      'Apply to multiple jobs at once with one click, without filling out repetitive forms. Our AI handles the busywork for you.',
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
      'Track your application success rates, get insights into your resume performance, and optimize your strategy with data.',
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

  // Determine if it's a mobile device to control hover/click behavior
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleCardClick = (index: number) => {
    setActiveDemo(index);
    // On mobile, also set the "hovered" state to true for a consistent look
    if (isMobile) {
      setHoveredCard(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    // Only apply hover effect on non-mobile devices
    if (!isMobile) {
      setHoveredCard(index);
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
          className="absolute w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${15 + mousePosition.x * 0.02}%`,
            top: `${10 + mousePosition.y * 0.02}%`,
            transform: `translate(-50%, -50%)`,
          }}
        />
        <div
          className="absolute w-52 h-52 md:w-80 md:h-80 bg-gradient-to-br from-cyan-400/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse"
          style={{
            right: `${20 + mousePosition.x * 0.015}%`,
            bottom: `${15 + mousePosition.y * 0.015}%`,
            transform: `translate(50%, 50%)`,
            animationDelay: '2s',
          }}
        />

        {/* Success Particles */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-400/30" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-green-100/50 backdrop-blur-sm border border-green-200/50 rounded-full mb-6 md:mb-8">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 animate-pulse" />
            <span className="text-green-700 font-semibold text-sm md:text-base">
              AI-Powered Solutions
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span className="text-gray-900">Meet Your</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Job Search Assistant
            </span>
          </h2>

          <p className="text-base md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            ZobsAI transforms every aspect of your job search with cutting-edge
            AI technology, turning the tedious process into an{' '}
            <span className="font-semibold text-purple-600">
              automated success machine
            </span>
            .
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            const isActive = activeDemo === index;

            return (
              <div
                key={index}
                className={`relative group cursor-pointer transform transition-all duration-500 ${
                  hoveredCard === index ? 'scale-105 z-20' : 'scale-100 z-10'
                } ${isActive ? 'ring-2 ring-purple-400/50' : ''}`}
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Background Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    solution.color
                  } rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500 transform ${
                    hoveredCard === index ? 'scale-110' : 'scale-100'
                  }`}
                />

                {/* Main Card */}
                <div
                  className={`relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-500 ${
                    isActive ? 'bg-white/80 border-purple-200' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start gap-5">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${solution.color} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {solution.title}
                        </h3>
                        <div
                          className={`px-3 py-1 mt-2 md:mt-0 bg-gradient-to-r ${solution.color} rounded-full text-white text-xs font-bold transform group-hover:scale-105 transition-all duration-300`}
                        >
                          {solution.stat}
                        </div>
                      </div>

                      <p className="text-base text-gray-600 mb-3 leading-relaxed">
                        {solution.description}
                      </p>

                      {/* Features List */}
                      <div
                        className={`space-y-1.5 transform transition-all duration-500 ${
                          hoveredCard === index
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-3'
                        }`}
                      >
                        {solution.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center gap-2 text-sm text-gray-500"
                          >
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Demo Badge */}
                      <Link
                        href="/login"
                        target="_blank"
                        className={`mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-100/50 backdrop-blur-sm rounded-full text-purple-700 text-sm font-medium transform transition-all duration-300 ${
                          isActive ? 'scale-105 bg-purple-100' : 'scale-100'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{solution.demo}</span>
                      </Link>
                    </div>

                    {/* Interactive Arrow */}
                    <div
                      className={`transform transition-all duration-300 ${
                        hoveredCard === index
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-4'
                      }`}
                    >
                      <ArrowRight className="w-5 h-5 text-purple-600" />
                    </div>
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
