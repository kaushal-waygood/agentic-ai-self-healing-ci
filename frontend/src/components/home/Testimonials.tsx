'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

const getThemeClasses = (theme: string) => {
  const themes: Record<string, any> = {
    blue: { gradient: 'from-blue-500 to-blue-600', ring: 'ring-blue-500/20' },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      ring: 'ring-purple-500/20',
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      ring: 'ring-emerald-500/20',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      ring: 'ring-orange-500/20',
    },
  };
  return themes[theme] || themes.blue;
};

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];
  const currentTheme = getThemeClasses(activeTestimonial.theme);

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, []);

  return (
    <section
      className="py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden"
      id="testimonials"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 mb-8 shadow-md">
            <User className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold text-gray-700 uppercase">
              Testimonials
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-6xl font-bold mb-6 text-gray-800">
            Success Stories from{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Real Users
            </span>
          </h2>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            loop
            centeredSlides
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 16 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 32 },
            }}
            className="!pb-20"
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

          {/* Navigation Buttons */}
          {/* <button
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-3 shadow-md hover:bg-gray-100 z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-3 shadow-md hover:bg-gray-100 z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button> */}
        </div>
      </div>

      {/* Pagination Dots */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 15px !important;
          height: 15px !important;
          background-color: #ffffff !important;
          border: 2px solid #d1d5db;
          opacity: 1 !important;
          border-radius: 50%;
          transition: all 0.3s;
        }
        .swiper-pagination-bullet-active {
          transform: scale(1.5);
          border-color: transparent;
          background-color: #3b82f6 !important;
        }
      `}</style>
    </section>
  );
}
