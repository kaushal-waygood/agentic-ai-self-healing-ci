import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Zap, Brain, FileText, Wand2 } from 'lucide-react';

const SleekLoadingCard = () => {
  const [loadingMessage, setLoadingMessage] = useState('Generating...');
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);

  const loadingMessages = [
    'Initializing AI...',
    'Processing data...',
    'Analyzing content...',
    'Optimizing results...',
    'Almost ready...',
  ];

  const icons = [Brain, FileText, Wand2, Sparkles, Zap, Loader2];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        setCurrentIcon(nextIndex);
        return loadingMessages[nextIndex];
      });
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1;
      });
    }, 360);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = icons[currentIcon];

  const particles = Array.from({ length: 12 }, (_, i) => (
    <div
      key={i}
      className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-ping opacity-75"
      style={{
        left: `${20 + Math.random() * 60}%`,
        top: `${20 + Math.random() * 60}%`,
        animationDelay: `${i * 0.2}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    />
  ));

  return (
    <div className="min-h-[400px] rounded-3xl  shadow-2xl backdrop-blur-sm overflow-hidden relative ">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 animate-pulse"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">{particles}</div>

      <div className="relative flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          {/* Main loading animation */}
          <div className="relative mb-8 w-32 h-32 mx-auto">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 w-32 h-32">
              <div
                className="w-full h-full border-4 border-transparent border-t-purple-500 border-r-blue-500 border-b-cyan-500 rounded-full animate-spin"
                style={{ animationDuration: '3s' }}
              ></div>
            </div>

            {/* Middle pulsing ring */}
            <div className="absolute inset-2 w-28 h-28 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-full h-full border-2 border-purple-400/50 rounded-full animate-pulse"></div>
            </div>

            {/* Inner content - properly centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-2xl border border-slate-600">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-full flex items-center justify-center animate-pulse">
                  <CurrentIcon className="w-10 h-10 text-white animate-bounce" />
                </div>
              </div>
            </div>

            {/* Floating icons around main loader */}
            {[Sparkles, Brain, FileText, Wand2].map((Icon, index) => (
              <div
                key={index}
                className="absolute top-1/2 left-1/2 w-8 h-8 text-slate-400 animate-pulse"
                style={{
                  transform: `translate(-50%, -50%) rotate(${
                    index * 90
                  }deg) translateY(-60px) rotate(-${index * 90}deg)`,
                  animationDelay: `${index * 0.5}s`,
                  animationDuration: '2s',
                }}
              >
                <Icon className="w-full h-full" />
              </div>
            ))}
          </div>

          {/* Loading message */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text mb-2 animate-pulse">
              {loadingMessage}
            </h2>

            {/* Percentage indicator */}
            <div className="mt-2 text-center">
              <span className="text-slate-300 font-medium">{progress}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex justify-center space-x-4">
            {['Analysis', 'Processing', 'Optimization'].map((step, index) => (
              <div
                key={step}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-500 ${
                  index <= Math.floor(progress / 34)
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                    index <= Math.floor(progress / 34)
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {index <= Math.floor(progress / 34) ? (
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  )}
                </div>
                <span className="text-xs text-slate-400">{step}</span>
              </div>
            ))}
          </div>

          {/* Pulsing dots */}
          <div className="flex justify-center space-x-1 mt-6">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-bounce"
                style={{
                  animationDelay: `${dot * 0.2}s`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleekLoadingCard;
