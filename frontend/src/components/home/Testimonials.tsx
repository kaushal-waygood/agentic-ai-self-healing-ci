'use client';

import React, { useState, useEffect, useRef } from 'react';
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

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Tech Startup',
    image: 'SC',
    rating: 5,
    content:
      'ZobsAI landed me 3 interviews in my first week! The AI customization is incredible - each application felt personally crafted.',
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
      'I was spending 40+ hours a week on applications with terrible results. ZobsAI automated everything and increased my response rate by 1200%.',
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
      'The ATS optimization is phenomenal. My resume went from getting rejected immediately to passing 90% of ATS systems.',
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
      'ZobsAI helped me transition careers seamlessly. The AI understood my transferable skills and positioned me perfectly for PM roles.',
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
      'As a creative, I was skeptical about AI handling my applications. But ZobsAI maintained my personal voice while optimizing for keywords.',
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
      'The multi-platform integration saved me countless hours. Instead of managing 6 different job sites, I just set my preferences once.',
    result: 'Saved 20+ hours/week',
    theme: 'purple',
  },
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const currentTheme = getThemeClasses(testimonials[activeIndex].theme);

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background elements */}
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

        {/* Swiper Testimonial */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            loop={true}
            centeredSlides={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              el: '.swiper-custom-pagination',
              clickable: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            breakpoints={{
              // when window width is >= 320px
              320: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              // when window width is >= 768px
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              // when window width is >= 1024px
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="!pb-20" // Add padding-bottom to make space for pagination
          >
            {testimonials.map((testimonial, index) => {
              const theme = getThemeClasses(testimonial.theme);
              return (
                <SwiperSlide key={index} className="h-full">
                  {({ isActive }) => (
                    <div
                      className={`h-full bg-white border border-gray-200 rounded-3xl p-6 shadow-lg transition-all duration-500 ease-out ${
                        isActive
                          ? `scale-100 ring-2 ${currentTheme.ring} shadow-xl`
                          : 'scale-90 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={`w-16 h-16 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}
                          >
                            {testimonial.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-800 font-bold text-lg">
                              {testimonial.name}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {testimonial.role}
                            </div>
                          </div>
                        </div>
                        <blockquote className="text-gray-700 text-base leading-relaxed font-medium flex-grow">
                          "{testimonial.content}"
                        </blockquote>
                        <div className="mt-4 bg-emerald-500/10 text-emerald-800 rounded-xl px-4 py-2 text-center font-bold text-sm">
                          🎯 {testimonial.result}
                        </div>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation & Pagination */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-full">
            <button className="swiper-button-prev-custom text-gray-600 hover:text-blue-500 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="swiper-custom-pagination !relative !w-auto mx-8"></div>
            <button className="swiper-button-next-custom text-gray-600 hover:text-blue-500 transition-colors">
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles for pagination dots */}
      <style jsx global>{`
        .swiper-custom-pagination .swiper-pagination-bullet {
          width: 1rem;
          height: 1rem;
          background-color: #ffffff;
          border: 2px solid #d1d5db; /* gray-300 */
          opacity: 1;
          transition: all 0.3s;
        }

        .swiper-custom-pagination .swiper-pagination-bullet-active {
          transform: scale(1.25);
          border-color: transparent;
        }
      `}</style>
    </section>
  );
}
