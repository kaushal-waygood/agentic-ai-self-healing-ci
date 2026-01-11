'use client';

import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { painPoints } from './data/solution';
import { useRouter } from 'next/navigation';

type FloatingIcon = {
  left: string;
  top: string;
  delay: string;
  duration: string;
};

export const PainPoints = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);
  const router = useRouter();

  // Generate random floating icon positions ONCE
  useEffect(() => {
    const icons: FloatingIcon[] = Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${4 + Math.random() * 2}s`,
    }));

    setFloatingIcons(icons);
  }, []);

  // Mouse tracking
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

  return (
    <section className="relative py-8 bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${10 + mousePosition.x * 0.02}%`,
            top: `${20 + mousePosition.y * 0.02}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div
          className="absolute w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-pulse"
          style={{
            right: `${10 + mousePosition.x * 0.015}%`,
            bottom: `${10 + mousePosition.y * 0.015}%`,
            transform: 'translate(50%, 50%)',
            animationDelay: '2s',
          }}
        />

        {/* Floating warning icons */}
        {floatingIcons.map((icon, i) => (
          <div
            key={i}
            className="absolute opacity-10 animate-float"
            style={{
              left: icon.left,
              top: icon.top,
              animationDelay: icon.delay,
              animationDuration: icon.duration,
            }}
          >
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-100/50 backdrop-blur-sm border border-red-200/50 rounded-full mb-8 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span className="text-lg text-red-700 font-bold uppercase">
              Job Search Reality Check
            </span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Job Search </span>
            <span className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700 bg-clip-text text-transparent animate-pulse">
              Struggle is Real
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Traditional job applications are broken. Job seekers face an uphill
            battle that wastes{' '}
            <span className="font-semibold text-red-600">
              time, energy, and opportunities
            </span>
            .
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-5 px-4">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer transform transition-all duration-500 ${
                activeCard === index ? 'scale-105 z-20' : 'scale-100 z-10'
              }`}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  point.bgColor
                } rounded-3xl transition-all duration-500 ${
                  activeCard === index
                    ? 'scale-110 opacity-100'
                    : 'scale-100 opacity-60'
                }`}
              />

              {/* Glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  point.color
                } rounded-3xl blur-xl transition-all duration-500 ${
                  activeCard === index
                    ? 'opacity-20 scale-110'
                    : 'opacity-0 scale-100'
                }`}
              />

              {/* Card */}
              <div className="relative flex flex-col h-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${
                      point.color
                    } rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                      activeCard === index ? 'scale-110 rotate-6' : ''
                    }`}
                  >
                    <point.icon className="w-8 h-8 text-white" />
                  </div>

                  <div
                    className={`px-4 py-2 bg-gradient-to-r ${
                      point.color
                    } rounded-full text-white text-sm font-bold shadow-lg transition-all duration-300 ${
                      activeCard === index ? 'scale-105' : ''
                    }`}
                  >
                    {point.stat}
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900">
                    {point.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {point.description}
                  </p>
                </div>

                <button
                  onClick={() => router.push('/signup')}
                  className={`mt-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-full rounded-xl transition-all duration-500 ${
                    activeCard === index
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  {point.button}
                </button>

                <div
                  className={`absolute top-4 right-4 transition-all duration-300 ${
                    activeCard === index ? 'opacity-100 rotate-45' : 'opacity-0'
                  }`}
                >
                  <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center">
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
