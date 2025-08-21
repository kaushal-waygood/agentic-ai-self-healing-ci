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
} from 'lucide-react';

export function CTA() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 32,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredButton, setHoveredButton] = useState(null);
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
      direction: Math.random() * 360,
    }));
    setParticlePositions(particles);

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset to 24 hours
              hours = 23;
              minutes = 59;
              seconds = 59;
            }
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
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

  const benefits = [
    { icon: Clock, text: 'Setup in 2 minutes', color: 'emerald' },
    { icon: Shield, text: 'No credit card required', color: 'blue' },
    { icon: Trophy, text: '30-day money-back guarantee', color: 'purple' },
  ];

  const socialProof = [
    { icon: Users, number: '10,000+', label: 'Active Users' },
    { icon: TrendingUp, number: '85%', label: 'Success Rate' },
    { icon: Target, number: '2.4M+', label: 'Applications Sent' },
  ];

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
          {/* Floating Badge */}
          <div
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8 shadow-2xl hover:scale-105 transition-all duration-500 group"
            style={{
              transform: `translateY(${isVisible ? 0 : -30}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '0.2s',
            }}
          >
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-emerald-400 font-bold text-lg">
              Ready to Transform Your Career?
            </span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>

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

          {/* Social Proof Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
            style={{
              transform: `translateY(${isVisible ? 0 : 40}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '0.8s',
            }}
          >
            {socialProof.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-2">
                  {item.number}
                </div>
                <div className="text-gray-300 text-sm">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Enhanced Benefits */}
          <div
            className="flex flex-col md:flex-row gap-6 justify-center mb-12 text-lg"
            style={{
              transform: `translateY(${isVisible ? 0 : 30}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '1s',
            }}
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 hover:bg-white/15 transition-all duration-300 group"
              >
                <div
                  className={`p-2 bg-gradient-to-r from-${benefit.color}-500 to-${benefit.color}-600 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Enhanced CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            style={{
              transform: `translateY(${isVisible ? 0 : 40}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '1.2s',
            }}
          >
            <button
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              onMouseEnter={() => setHoveredButton('primary')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Rocket className="w-6 h-6 group-hover:rotate-12 group-hover:scale-125 transition-all duration-300" />
              Start Your Free Trial
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              {/* Hover particles */}
              {hoveredButton === 'primary' && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </button>

            <button
              className="group relative bg-white/10 backdrop-blur-xl border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/20 px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              onMouseEnter={() => setHoveredButton('secondary')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Play className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
              Watch 2-Min Demo
              <Eye className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>

          {/* Enhanced Urgency Element */}
          <div
            className="relative max-w-2xl mx-auto"
            style={{
              transform: `translateY(${isVisible ? 0 : 30}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '1.4s',
            }}
          >
            <div className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 backdrop-blur-xl border border-orange-300/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-500">
              {/* Animated border */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="absolute inset-[2px] bg-gray-900/90 backdrop-blur-xl rounded-3xl" />

              <div className="relative z-10">
                {/* Timer Header */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl animate-pulse">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-black text-2xl text-white">
                    Limited Time Offer
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {[
                    { value: timeLeft.hours, label: 'Hours' },
                    { value: timeLeft.minutes, label: 'Minutes' },
                    { value: timeLeft.seconds, label: 'Seconds' },
                  ].map((time, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-2">
                        <span className="text-3xl font-black text-white">
                          {String(time.value).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-gray-300 text-sm font-semibold">
                        {time.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-gray-300 text-lg leading-relaxed">
                  First 1,000 users get{' '}
                  <span className="text-orange-400 font-black text-xl">
                    50% OFF
                  </span>{' '}
                  their first 3 months. Join now before this exclusive offer
                  expires!
                </p>

                {/* Urgency indicators */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-sm font-semibold">
                      847 spots remaining
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full" />
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm font-semibold">
                      23 viewing now
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4">
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Zap className="w-5 h-5 text-blue-400 animate-bounce" />
              </div>
            </div>
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

        /* Custom pulse animation */
        @keyframes custom-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Shimmer effect */
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Enhanced transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Glassmorphism enhancements */
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }

        /* Button hover effects */
        .group:hover .group-hover\\:rotate-12 {
          transform: rotate(12deg);
        }
      `}</style>
    </section>
  );
}
