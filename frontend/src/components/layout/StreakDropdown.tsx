'use client';

import { Flame, Bell, ArrowBigRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type StreakDropdownProps = {
  streak?: number;
  longest?: number;
  activeDays?: number[]; // Example: [1,3,5] meaning Tue, Thu, Sat
  // onReminderClick?: () => void;
};

export default function StreakDropdown({
  streak = 0,
  longest = 0,
  activeDays = [],
}: // onReminderClick = () => {},
StreakDropdownProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`
        absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl border 
        p-4 z-50 transform transition-all duration-300
        ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
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
          const isToday = idx === new Date().getDay() - 1;
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
        Total reading days:{' '}
        <span className="font-semibold">{activeDays.length}</span>
      </div>

      {/* <div className="mt-1 text-xs text-blue-600 underline">Asia/Kolkata</div> */}

      {/* Reminder CTA */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
        <span className="text-sm font-medium">Check In </span>

        <button
          // onClick={onReminderClick}
          className="bg-pink-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
        >
          <ArrowBigRight className="w-4 h-4" />
          <span>Go</span>
        </button>
      </div>
    </div>
  );
}
