'use client';

import { Flame, ArrowBigRight } from 'lucide-react';

type StreakDropdownProps = {
  streak: number;
  longest: number;
  activeDays: number[]; // 0..6, Monday-first (0=Mon, 6=Sun)
  canClaimToday: boolean;
  isClaiming: boolean;
  onCheckIn: () => void;
};

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  const map = [6, 0, 1, 2, 3, 4, 5];
  return map[jsDay];
}

export default function StreakDropdown({
  streak = 0,
  longest = 0,
  activeDays = [],
  canClaimToday,
  isClaiming,
  onCheckIn,
}: StreakDropdownProps) {
  const todayIdx = getTodayIndex();

  return (
    <div
      className="
            fixed md:absolute
            top-16 md:top-full
            left-4 right-4 md:left-auto md:right-0
            mt-0 md:mt-2
            w-auto md:w-80
            p-4
            bg-white rounded-xl
            shadow-2xl border border-slate-200
            z-50
          "
    >
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{streak}</span>
          <span className="text-xs text-gray-500">Current streak</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{longest}</span>
          <span className="text-xs text-gray-500">Longest streak 🏆</span>
        </div>
      </div>

      {/* Week dots */}
      <div className="flex justify-between items-center mt-4">
        {days.map((d, idx) => {
          const isToday = idx === todayIdx;
          const hasRead = activeDays.includes(idx);

          return (
            <div key={idx} className="flex flex-col items-center">
              {isToday ? (
                <Flame className="text-pink-500 w-6 h-6" />
              ) : (
                <div
                  className={`
                    w-6 h-6 rounded-full border 
                    ${
                      hasRead
                        ? 'bg-pink-500 border-pink-500'
                        : 'border-gray-300'
                    }
                  `}
                />
              )}
              <span className="text-xs mt-1">{d}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm">
        Total active days:{' '}
        <span className="font-semibold">{activeDays.length}</span>
      </div>

      {/* Reminder / Check-in CTA */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
        <span className="text-sm font-medium">
          {canClaimToday ? 'Daily check-in available' : 'Come back tomorrow'}
        </span>

        <button
          onClick={canClaimToday ? onCheckIn : undefined}
          disabled={!canClaimToday || isClaiming}
          className={`
            px-3 py-1 rounded-lg text-sm flex items-center gap-1
            ${
              canClaimToday && !isClaiming
                ? 'bg-pink-500 text-white' // Active style
                : 'bg-gray-300 text-gray-600 cursor-not-allowed' // Disabled style
            }
          `}
        >
          <ArrowBigRight className="w-4 h-4" />
          <span>{isClaiming ? '...' : 'Go'}</span>
        </button>
      </div>
    </div>
  );
}
