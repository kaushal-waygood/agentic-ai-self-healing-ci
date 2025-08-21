'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Search,
  Filter,
  Link,
  Eye,
  MousePointer,
  Sparkles,
} from 'lucide-react';
import { platforms, stats } from './data/solution';
import './styles/platforms.css'; // Import the new CSS file

export function Platforms() {
  const [hoveredPlatform, setHoveredPlatform] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const sectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const PlatformCard = ({ platform, index, isHovered }) => {
    return (
      <div
        className={`relative group cursor-pointer transition-all duration-700 transform-gpu ${
          isHovered ? 'scale-105 z-20' : 'hover:scale-102 z-10'
        }`}
        style={{
          transform: `translateY(${isVisible ? 0 : 50}px) scale(${
            isHovered ? 1.05 : isVisible ? 1 : 0.9
          })`,
          opacity: isVisible ? 1 : 0,
          transitionDelay: `${index * 150}ms`,
        }}
        onMouseEnter={() => setHoveredPlatform(index)}
        onMouseLeave={() => setHoveredPlatform(null)}
      >
        <div
          className={`relative bg-white/95 backdrop-blur-xl border-2 rounded-2xl overflow-hidden transition-all duration-500 ${
            isHovered
              ? `border-${platform.color}-300 shadow-2xl shadow-${platform.color}-200/30`
              : 'border-white/30 shadow-lg hover:shadow-xl'
          }`}
        >
          {/* Platform Icon Header */}
          <div
            className={`h-16 bg-gradient-to-r ${platform.lightGradient} relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                platform.gradient
              } opacity-0 ${
                isHovered ? 'opacity-20' : 'group-hover:opacity-10'
              } transition-opacity duration-500`}
            />

            {/* Floating emoji icon */}
            <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {platform.icon}
              </span>
            </div>

            {/* Popularity indicator */}
            <div className="absolute top-2 right-4">
              <div
                className={`px-2 py-1 bg-gradient-to-r ${platform.gradient} text-white text-xs font-bold rounded-full shadow-sm`}
              >
                {platform.popularity}%
              </div>
            </div>

            {/* Animated background particles */}
            <div className="absolute top-2 left-20 w-1 h-1 bg-white/50 rounded-full animate-pulse" />
            <div
              className="absolute bottom-2 right-8 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </div>

          <div className="p-6">
            {/* Platform Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {platform.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {platform.description}
                </p>
              </div>
            </div>

            {/* Job Count Badge */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${platform.lightGradient} rounded-xl border border-${platform.color}-200`}
              >
                <Briefcase className={`w-4 h-4 text-${platform.color}-600`} />
                <span
                  className={`text-sm font-bold text-${platform.color}-700`}
                >
                  {platform.jobs}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(platform.popularity / 20)
                        ? `text-${platform.color}-400 fill-current`
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2 mb-4">
              {platform.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <CheckCircle
                    className={`w-3 h-3 text-${platform.color}-500`}
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Connection Status */}
            {isHovered && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">
                      Connected
                    </span>
                  </div>
                  <Link className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
          />
        </div>
      </div>
    );
  };

  const StatCard = ({ stat, index }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (isVisible && !hasAnimated) {
        const timer = setTimeout(() => {
          const targetNumber = parseInt(stat.number.replace(/[^0-9]/g, ''));
          let current = 0;
          const increment = targetNumber / 50;

          const counter = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
              setCount(targetNumber);
              clearInterval(counter);
              setHasAnimated(true);
            } else {
              setCount(Math.floor(current));
            }
          }, 30);
        }, index * 200);

        return () => clearTimeout(timer);
      }
    }, [isVisible, stat.number, index, hasAnimated]);

    return (
      <div
        className="relative group text-center bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
        style={{
          transform: `translateY(${isVisible ? 0 : 30}px)`,
          opacity: isVisible ? 1 : 0,
          transitionDelay: `${index * 150}ms`,
        }}
      >
        {/* Icon Container */}
        <div
          className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
        >
          <stat.icon className="w-8 h-8 text-white" />
        </div>

        {/* Animated Number */}
        <div className="text-4xl font-black mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {hasAnimated
            ? stat.number
            : `${count}${stat.number.includes('+') ? '+' : ''}`}
        </div>

        <div className="font-bold text-lg mb-2 text-gray-800">{stat.label}</div>
        <div className="text-gray-600">{stat.description}</div>

        {/* Hover Effect Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500 pointer-events-none`}
        />
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), linear-gradient(135deg, #f8fafc 0%, #e0f2fe 30%, #f3e8ff 70%, #fdf2f8 100%)`,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float opacity-60" />
        <div
          className="absolute bottom-32 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float opacity-60"
          style={{ animationDelay: '2s', animationDirection: 'reverse' }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse opacity-50" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full px-6 py-3 mb-8 shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-700">
              Platform Integration
            </span>
            <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Apply Everywhere from{' '}
            <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text">
              One Platform
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            ZobsAI connects to all major job boards and career sites, giving you
            access to millions of opportunities without the hassle of managing
            multiple accounts.
          </p>
        </div>

        {/* Interactive Platforms Grid */}
        <div className="mb-24">
          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-2 shadow-xl">
              {['all', 'popular', 'premium'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {platforms.map((platform, index) => (
              <PlatformCard
                key={index}
                platform={platform}
                index={index}
                isHovered={hoveredPlatform === index}
              />
            ))}
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-12 shadow-2xl text-white mb-24 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl animate-float" />
            <div
              className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/30 rounded-full blur-2xl animate-float"
              style={{ animationDelay: '1s' }}
            />
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <MousePointer className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-4xl font-bold">See Integration in Action</h3>
            </div>

            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Watch how seamlessly ZobsAI connects to multiple job platforms and
              applies to hundreds of positions automatically.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
              {[
                {
                  icon: Search,
                  text: 'Auto Search',
                  desc: 'Across all platforms',
                },
                {
                  icon: Filter,
                  text: 'Smart Filter',
                  desc: 'Perfect job matches',
                },
                { icon: Zap, text: 'Instant Apply', desc: 'Bulk applications' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-110 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300">
                    <item.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="font-bold text-lg mb-2">{item.text}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-emerald-300/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                <Eye className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
                Watch Demo
              </button>
              <button className="group border-2 border-white/40 hover:border-white/70 text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3">
                Connect Platforms
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
