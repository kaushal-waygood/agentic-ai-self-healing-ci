'use client';

import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { painPoints } from './data/solution';

export const PainPoints = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % painPoints.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <section className="relative py-32 bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${10 + mousePosition.x * 0.02}%`,
            top: `${20 + mousePosition.y * 0.02}%`,
            transform: `translate(-50%, -50%)`,
          }}
        />
        <div
          className="absolute w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-pulse"
          style={{
            right: `${10 + mousePosition.x * 0.015}%`,
            bottom: `${10 + mousePosition.y * 0.015}%`,
            transform: `translate(50%, 50%)`,
            animationDelay: '2s',
          }}
        />

        {/* Floating Warning Symbols */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          >
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-100/50 backdrop-blur-sm border border-red-200/50 rounded-full mb-8 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-semibold">
              Job Search Reality Check
            </span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">The Job Search</span>
            <br />
            <span className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700 bg-clip-text text-transparent animate-pulse">
              Struggle Is Real
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Traditional job applications are broken. Job seekers face an uphill
            battle that wastes
            <span className="font-semibold text-red-600">
              time, energy, and opportunities
            </span>
            .
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-4">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer transform transition-all duration-500 ${
                activeCard === index ? 'scale-105 z-20' : 'scale-100 z-10'
              }`}
              onMouseEnter={() => setActiveCard(index)} // Set active card on hover
              onMouseLeave={() => setActiveCard(null)} // Reset on mouse leave
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Card Background with Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  point.bgColor
                } rounded-3xl transition-all duration-500 ${
                  activeCard === index
                    ? 'scale-110 opacity-100'
                    : 'scale-100 opacity-60'
                }`}
              />

              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  point.color
                } rounded-3xl blur-xl opacity-0 ${
                  activeCard === index
                    ? 'opacity-20 scale-110'
                    : 'opacity-0 scale-100'
                } transition-all duration-500 transform`}
              />

              {/* Main Card Content */}
              <div className="relative flex flex-col h-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                {/* Icon and Stat Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${
                      point.color
                    } rounded-2xl flex items-center justify-center shadow-lg transform ${
                      activeCard === index ? 'scale-110 rotate-6' : 'scale-100'
                    } transition-all duration-300`}
                  >
                    <point.icon className="w-8 h-8 text-white" />
                  </div>

                  <div
                    className={`px-4 py-2 bg-gradient-to-r ${
                      point.color
                    } rounded-full text-white text-sm font-bold shadow-lg transform ${
                      activeCard === index ? 'scale-105' : 'scale-100'
                    } transition-all duration-300`}
                  >
                    {point.stat}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                    {point.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {point.description}
                  </p>
                </div>

                {/* Solution Preview */}
                <button
                  className={`mt-6 p-4 bg-green-50 backdrop-blur-sm w-full border border-green-200 rounded-xl transform transition-all duration-500 ${
                    activeCard === index
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  Try This
                </button>

                {/* Interactive Elements */}
                <div
                  className={`absolute top-4 right-4 transform transition-all duration-300 ${
                    activeCard === index ? 'opacity-100 rotate-45' : 'opacity-0'
                  }`}
                >
                  <div className="w-8 h-8 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
