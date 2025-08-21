'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Target,
  Award,
  Play,
  Pause,
} from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Tech Startup',
    image: 'SC',
    rating: 5,
    content:
      'ZobsAI landed me 3 interviews in my first week! The AI customization is incredible - each application felt personally crafted. Went from 0 responses to multiple offers.',
    result: '3 interviews in 1 week',
    theme: 'blue',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Marketing Manager',
    company: 'Fortune 500',
    image: 'MR',
    rating: 5,
    content:
      'I was spending 40+ hours a week on applications with terrible results. ZobsAI automated everything and increased my response rate by 1200%. Absolute game changer!',
    result: '1200% response rate increase',
    theme: 'purple',
  },
  {
    name: 'Emily Johnson',
    role: 'Data Analyst',
    company: 'Consulting Firm',
    image: 'EJ',
    rating: 5,
    content:
      'The ATS optimization is phenomenal. My resume went from getting rejected immediately to passing 90% of ATS systems. Finally broke through the application black hole!',
    result: '90% ATS pass rate',
    theme: 'emerald',
  },
  {
    name: 'David Park',
    role: 'Product Manager',
    company: 'SaaS Company',
    image: 'DP',
    rating: 5,
    content:
      'ZobsAI helped me transition careers seamlessly. The AI understood my transferable skills and positioned me perfectly for PM roles. Got hired in 3 weeks!',
    result: 'Career change in 3 weeks',
    theme: 'orange',
  },
  {
    name: 'Rachel Thompson',
    role: 'UX Designer',
    company: 'Design Agency',
    image: 'RT',
    rating: 5,
    content:
      'As a creative, I was skeptical about AI handling my applications. But ZobsAI maintained my personal voice while optimizing for keywords. Brilliant balance!',
    result: 'Maintained personal voice',
    theme: 'blue',
  },
  {
    name: 'Ahmed Hassan',
    role: 'Financial Analyst',
    company: 'Investment Bank',
    image: 'AH',
    rating: 5,
    content:
      'The multi-platform integration saved me countless hours. Instead of managing 6 different job sites, I just set my preferences once and let ZobsAI handle everything.',
    result: 'Saved 20+ hours/week',
    theme: 'purple',
  },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy Users', theme: 'blue' },
  {
    icon: TrendingUp,
    value: '2.5M+',
    label: 'Applications Sent',
    theme: 'purple',
  },
  { icon: Target, value: '87%', label: 'Success Rate', theme: 'emerald' },
  { icon: Award, value: '4.9/5', label: 'User Rating', theme: 'orange' },
];

const getThemeClasses = (theme) => {
  const themes = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-200',
      ring: 'ring-blue-500/20',
      hover: 'hover:bg-blue-50',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      border: 'border-purple-200',
      ring: 'ring-purple-500/20',
      hover: 'hover:bg-purple-50',
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      ring: 'ring-emerald-500/20',
      hover: 'hover:bg-emerald-50',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-200',
      ring: 'ring-orange-500/20',
      hover: 'hover:bg-orange-50',
    },
  };
  return themes[theme] || themes.blue;
};

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 200);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const nextTestimonial = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 200);
  };

  const prevTestimonial = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length,
      );
      setIsAnimating(false);
    }, 200);
  };

  const goToTestimonial = (index) => {
    if (index === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 200);
  };

  const currentTestimonial = testimonials[currentIndex];
  const currentTheme = getThemeClasses(currentTestimonial.theme);

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200 shadow-sm mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600">
              4.9/5 from 10,000+ users
            </span>
          </div>

          <h2 className="text-5xl font-bold mb-6 text-gray-800">
            Success Stories from{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Real Users
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who transformed their job search
            with ZobsAI
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="mb-20">
          <div className="relative max-w-5xl mx-auto">
            <div
              className={`bg-white border border-gray-200 rounded-3xl p-8 shadow-lg transition-all duration-500 ${
                currentTheme.ring
              } ring-1 ${
                isAnimating
                  ? 'opacity-80 scale-98'
                  : 'opacity-100 scale-100 hover:shadow-xl hover:-translate-y-1'
              }`}
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
            >
              <div className="flex items-start gap-8">
                <div
                  className={`w-24 h-24 bg-gradient-to-br ${currentTheme.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}
                >
                  {currentTestimonial.image}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex gap-1">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <div
                      className={`px-3 py-1 ${currentTheme.bg} text-white text-sm font-medium rounded-full`}
                    >
                      Verified User
                    </div>
                  </div>

                  <blockquote className="text-gray-700 text-xl leading-relaxed mb-6 font-medium">
                    "{currentTestimonial.content}"
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-800 font-bold text-xl mb-1">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-gray-500 text-lg">
                        {currentTestimonial.role} at{' '}
                        {currentTestimonial.company}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl px-6 py-3 shadow-lg">
                      <div className="text-white font-bold">
                        🎯 {currentTestimonial.result}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white border border-gray-200 rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
              disabled={isAnimating}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white border border-gray-200 rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
              disabled={isAnimating}
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-3 mt-10">
              {testimonials.map((testimonial, index) => {
                const dotTheme = getThemeClasses(testimonial.theme);
                return (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                      index === currentIndex
                        ? `${dotTheme.bg} border-transparent scale-125 shadow-lg`
                        : 'bg-white border-gray-300 hover:border-gray-400 hover:scale-110'
                    }`}
                    disabled={isAnimating}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => {
            const theme = getThemeClasses(testimonial.theme);
            const isActive = index === currentIndex;

            return (
              <div
                key={index}
                className={`group bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isActive
                    ? `${theme.border} ${theme.ring} ring-2 shadow-lg scale-105`
                    : 'border-gray-200 hover:border-gray-300'
                } ${theme.hover}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => goToTestimonial(index)}
              >
                <div className="flex justify-between items-start mb-4">
                  <Quote
                    className={`w-8 h-8 transition-all duration-300 ${
                      hoveredCard === index || isActive
                        ? theme.text
                        : 'text-gray-400'
                    }`}
                  />
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  "{testimonial.content}"
                </p>

                <div
                  className={`bg-gradient-to-r ${
                    theme.gradient
                  } rounded-xl p-4 mb-6 transform transition-all duration-300 ${
                    hoveredCard === index ? 'scale-105 shadow-md' : ''
                  }`}
                >
                  <div className="text-white font-semibold text-sm">
                    🎯 Result: {testimonial.result}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${
                      theme.gradient
                    } rounded-xl flex items-center justify-center text-white font-bold shadow-md transform transition-all duration-300 ${
                      hoveredCard === index ? 'scale-110 rotate-3' : ''
                    }`}
                  >
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-gray-400">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const theme = getThemeClasses(stat.theme);
            const IconComponent = stat.icon;

            return (
              <div
                key={index}
                className={`group bg-white border border-gray-200 rounded-2xl p-8 text-center transition-all duration-500 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${theme.hover}`}
                onMouseEnter={() => setHoveredCard(`stat-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${theme.gradient} rounded-2xl mb-6 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <IconComponent className="w-10 h-10 text-white" />
                </div>

                <div
                  className={`text-4xl font-bold mb-2 transition-all duration-300 ${
                    theme.text
                  } ${hoveredCard === `stat-${index}` ? 'scale-110' : ''}`}
                >
                  {stat.value}
                </div>

                <div className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 font-medium">
                  {stat.label}
                </div>

                {/* Progress Bar */}
                <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      theme.gradient
                    } rounded-full transition-all duration-1000 ${
                      hoveredCard === `stat-${index}` ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Auto-play Control */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 font-medium transition-all duration-300 ${
              autoPlay
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            {autoPlay ? (
              <>
                <Pause className="w-4 h-4" />
                Auto-playing testimonials
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume auto-play
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
