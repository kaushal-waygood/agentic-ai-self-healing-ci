'use client';

import { Flame, Sparkles, Gift, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyStreak } from '@/hooks/credits/useStreakCredit';

interface StreakPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  const map = [6, 0, 1, 2, 3, 4, 5];
  return map[jsDay];
}

export default function StreakPopup({ isOpen, onClose }: StreakPopupProps) {
  const { streak, claiming, claim } = useDailyStreak();

  const todayIdx = getTodayIndex();
  const activeDays = streak?.activeDays || [];

  const handleClaim = async () => {
    await claim();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-2xl shadow-2xl border-2 border-yellow-400 overflow-hidden">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/50 rounded-full z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="p-6 relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center mb-2"
                >
                  <Flame className="w-20 h-20 text-orange-500 drop-shadow-lg" />
                </motion.div>

                {/* Title */}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
                    DAILY STREAK!
                  </h2>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>

                {/* Streak counter */}
                <motion.div
                  className="text-center mb-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-5xl font-black text-orange-600">
                    {streak?.current || 0}
                  </span>
                  <span className="text-xl text-orange-400 ml-2">days</span>
                </motion.div>

                {/* Week dots */}
                <div className="flex justify-between items-center mt-4 mb-4">
                  {days.map((d, idx) => {
                    const isToday = idx === todayIdx;
                    const isActive = activeDays.includes(idx);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        {isToday ? (
                          <Flame className="text-pink-500 w-8 h-8 drop-shadow-lg" />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              isActive
                                ? 'bg-gradient-to-br from-pink-500 to-orange-500 border-yellow-400'
                                : 'bg-gray-200 border-gray-300'
                            }`}
                          >
                            {isActive && (
                              <Flame className="w-4 h-4 text-white" />
                            )}
                          </div>
                        )}
                        <span className="text-xs font-bold mt-1 text-gray-700">
                          {d}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="flex justify-between bg-white/50 p-3 rounded-xl mb-4">
                  <div className="text-center">
                    <span className="text-xl font-bold text-orange-600">
                      {streak?.current || 0}
                    </span>
                    <span className="text-xs text-gray-600 block">Current</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold text-purple-600">
                      {streak?.longest || 0}
                    </span>
                    <span className="text-xs text-gray-600 block">Best</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold text-pink-600">
                      {activeDays.length}
                    </span>
                    <span className="text-xs text-gray-600 block">Active</span>
                  </div>
                </div>

                {/* Claim Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaim}
                  disabled={!streak?.canClaimToday || claiming}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl ${
                    streak?.canClaimToday && !claiming
                      ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {claiming ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-6 h-6" />
                      <span>CLAIM REWARD</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-sm text-gray-600 mt-3">
                  {streak?.canClaimToday
                    ? "Don't break your streak! 🔥"
                    : 'Come back tomorrow for more! ✨'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
