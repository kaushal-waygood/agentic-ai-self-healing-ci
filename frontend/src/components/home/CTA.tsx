'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle,
  Zap,
  Star,
  Trophy,
  Shield,
  Play,
  Gift,
  Users,
  TrendingUp,
  Target,
  Rocket,
  Eye,
  MousePointer,
  Award,
} from 'lucide-react';

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

// FIXED: Added the missing helper function
const getThemeClasses = (theme) => {
  const themes = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-50',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-50',
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-600',
      hover: 'hover:bg-emerald-50',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-50',
    },
  };
  return themes[theme] || themes.blue; // Default to blue theme
};

export function CTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [particlePositions, setParticlePositions] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    // Generate initial particle positions
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
    }));
    setParticlePositions(particles);
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

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden min-h-screen flex items-center"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 75%, #1a1a2e 100%)
        `,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float opacity-70" />
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float opacity-70"
          style={{ animationDelay: '2s', animationDirection: 'reverse' }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse opacity-50" />

        {/* Floating particles */}
        {particlePositions.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.id * 0.2}s`,
              animationDuration: `${4 + particle.speed}s`,
            }}
          />
        ))}

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h2
            className="text-6xl lg:text-8xl font-black mb-8 leading-tight text-white"
            style={{
              transform: `translateY(${isVisible ? 0 : 50}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '0.4s',
            }}
          >
            Stop Applying.
            <br />
            Start{' '}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text animate-gradient">
              Landing Jobs
            </span>
            .
          </h2>

          {/* Enhanced Description */}
          <p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            style={{
              transform: `translateY(${isVisible ? 0 : 30}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '0.6s',
            }}
          >
            Join the AI job search revolution. Let ZobsAI handle the
            applications while you prepare for interviews and negotiate offers.
          </p>

          {/* Stats Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const theme = getThemeClasses(stat.theme);
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white/20 hover:-translate-y-2 cursor-pointer`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${theme.gradient} rounded-2xl mb-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 text-white`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 group-hover:text-white transition-colors duration-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
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
            transform: translateY(-20px) rotate(2deg);
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

        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </section>
  );
}
