import React from 'react';

import Image from 'next/image';

export default function GeneratingAgent() {
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 md:gap-12">
        {/* Logo container with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-75 animate-pulse"></div>
          <div className="relative w-24 h-24 md:w-32 md:h-32  rounded-full flex items-center justify-center shadow-2xl">
            <Image
              src="/logo.png"
              alt="zobsai logo"
              width={100}
              height={100}
              className="w-10 h-10 animate-bounce"
            />
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            Generating Agent
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-light tracking-wide">
            Please wait...
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-64 md:w-80 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-[slideRight_3s_infinite]"
            style={{
              animation: 'slideRight 2s infinite',
            }}
          />
        </div>

        {/* Dots animation */}
        <div className="flex gap-2">
          <span
            className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          ></span>
          <span
            className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></span>
          <span
            className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.4s' }}
          ></span>
        </div>

        {/* Status text */}
        <p className="text-sm md:text-base text-slate-400 mt-4 text-center max-w-xs md:max-w-sm">
          Setting up your AI agent with optimal configurations...
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
