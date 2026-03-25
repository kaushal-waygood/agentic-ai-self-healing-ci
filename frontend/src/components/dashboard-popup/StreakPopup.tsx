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
            <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border-2 border-primary/20 bg-background shadow-2xl ring-1 ring-accent/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 rounded-full border border-border/70 bg-background/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/15 p-6">
                <div className="absolute -left-12 top-6 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />

                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10 mb-2 flex justify-center"
                >
                  <Flame className="w-20 h-20 text-primary drop-shadow-lg" />
                </motion.div>

                {/* Title */}
                <div className="relative z-10 mb-1 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-black text-transparent">
                    DAILY STREAK!
                  </h2>
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>

                {/* Streak counter */}
                <motion.div
                  className="relative z-10 mb-4 text-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-5xl font-black text-transparent">
                    {streak?.current || 0}
                  </span>
                  <span className="ml-2 text-xl text-muted-foreground">
                    days
                  </span>
                </motion.div>

                {/* Week dots */}
                <div className="relative z-10 mb-4 mt-4 flex items-center justify-between">
                  {days.map((d, idx) => {
                    const isToday = idx === todayIdx;
                    const isActive = activeDays.includes(idx);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        {isToday ? (
                          <Flame className="w-8 h-8 text-accent drop-shadow-lg" />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              isActive
                                ? 'border-primary/30 bg-gradient-to-br from-primary to-accent shadow-md'
                                : 'border-border bg-background/80 backdrop-blur-sm'
                            }`}
                          >
                            {isActive && (
                              <Flame className="w-4 h-4 text-primary-foreground" />
                            )}
                          </div>
                        )}
                        <span className="mt-1 text-xs font-bold text-muted-foreground">
                          {d}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="relative z-10 mb-4 flex justify-between rounded-2xl border border-border/80 bg-background/75 p-3 shadow-sm backdrop-blur-sm">
                  <div className="text-center">
                    <span className="text-xl font-bold text-primary">
                      {streak?.current || 0}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Current
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold text-accent">
                      {streak?.longest || 0}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Best
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold text-foreground">
                      {activeDays.length}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Active
                    </span>
                  </div>
                </div>

                {/* Claim Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaim}
                  disabled={!streak?.canClaimToday || claiming}
                  className={`relative z-10 flex w-full items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold shadow-xl ${
                    streak?.canClaimToday && !claiming
                      ? 'bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground'
                      : 'cursor-not-allowed bg-muted text-muted-foreground shadow-none'
                  }`}
                >
                  {claiming ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
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

                <p className="relative z-10 mt-3 text-center text-sm text-muted-foreground">
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
