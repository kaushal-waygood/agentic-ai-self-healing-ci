'use client';

import React, { useEffect, useRef } from 'react';
import {
  Briefcase,
  Globe,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { platforms } from './data/solution'; // Assuming data is in this file

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function Platforms() {
  const swiperRef = useRef(null);

  const PlatformCard = ({ platform }) => {
    return (
      <div className="h-full p-1">
        {' '}
        {/* Padding for hover effect */}
        <div className="relative bg-white/50 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden h-full transition-all duration-300 group shadow-lg hover:shadow-2xl hover:border-white/40">
          {/* Subtle Border Gradient on Hover */}
          <div
            className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-${platform.color}-400 transition-all duration-300 opacity-0 group-hover:opacity-100`}
          ></div>

          {/* Card Header */}
          <div className="p-6 pb-0">
            <div className="flex justify-between items-center">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${platform.gradient} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-4xl">{platform.icon}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full border border-gray-200/50">
                <div className={`w-2 h-2 rounded-full ${platform.bg}`}></div>
                <span className={`text-sm font-bold ${platform.text}`}>
                  {platform.popularity}% Popular
                </span>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                {platform.name}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {platform.description}
              </p>
              <div
                className={`inline-flex items-center gap-2 px-3 py-2 mb-5 bg-gradient-to-r ${platform.lightGradient} rounded-xl border border-${platform.color}-200`}
              >
                <Briefcase className={`w-4 h-4 text-${platform.color}-700`} />
                <span
                  className={`text-sm font-bold text-${platform.color}-800`}
                >
                  {platform.jobs}
                </span>
              </div>
            </div>

            {/* "Connect" button appears at the bottom on hover */}
            <div className="mt-auto h-12 flex items-end">
              <button className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:bg-gray-900 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                Connect
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-50"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 mb-8 shadow-md">
            <Globe className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold text-gray-700">
              Platform Integration
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
            Apply Everywhere from{' '}
            <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text">
              One Platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ZobsAI connects to all major job boards, giving you access to
            millions of opportunities without the hassle.
          </p>
        </div>

        <div className="relative">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next-platforms',
              prevEl: '.swiper-button-prev-platforms',
            }}
            pagination={{ el: '.swiper-pagination-platforms', clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 32 },
            }}
            className="!pb-20" // Add padding for pagination and navigation
          >
            {platforms.map((platform, index) => (
              <SwiperSlide key={index} className="h-auto">
                <PlatformCard platform={platform} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation & Pagination */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-full max-w-md">
            <button className="swiper-button-prev-platforms p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-md hover:bg-white transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="swiper-pagination-platforms !relative !w-auto mx-4"></div>
            <button className="swiper-button-next-platforms p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-md hover:bg-white transition-colors">
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Custom styles for Swiper pagination pills */
        .swiper-pagination-platforms .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background-color: #9ca3af; /* gray-400 */
          opacity: 1;
          transition: all 0.3s ease;
        }

        .swiper-pagination-platforms .swiper-pagination-bullet-active {
          width: 32px;
          border-radius: 8px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }
      `}</style>
    </section>
  );
}
