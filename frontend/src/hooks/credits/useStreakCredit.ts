// hooks/useDailyStreak.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchDailyStreak,
  claimDailyStreakApi,
  DailyStreakResponse,
} from '@/services/api/streakApi';

type StreakState = {
  current: number;
  longest: number;
  lastClaimedAt: string | null;
  activeDays: number[];
  canClaimToday: boolean;
  freezeTokens?: number;
};

export function useDailyStreak() {
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    longest: 0,
    lastClaimedAt: null,
    activeDays: [],
    canClaimToday: false,
    freezeTokens: 0,
  });

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDailyStreak();

      const activeDays = computeActiveDays(
        data.streak.current,
        data.streak.lastClaimedAt,
      );

      setStreak({
        current: data.streak.current,
        longest: data.streak.longest,
        lastClaimedAt: data.streak.lastClaimedAt,
        activeDays,
        canClaimToday: data.canClaimToday,
        freezeTokens: data.streak.freezeTokens ?? 0,
      });
    } catch (err: any) {
      console.error('Failed to fetch streak:', err);
      setError('Failed to load streak');
    } finally {
      setLoading(false);
    }
  }, []);

  const claim = useCallback(async () => {
    try {
      setClaiming(true);
      setError(null);
      const res = await claimDailyStreakApi();

      // Backend returns updated streak in `res.streak`
      const { streak: s } = res;

      const activeDays = computeActiveDays(s.current, s.lastClaimedAt);

      setStreak((prev) => ({
        ...prev,
        current: s.current,
        longest: s.longest,
        lastClaimedAt: s.lastClaimedAt,
        activeDays,
        canClaimToday: false, // just claimed
        freezeTokens: s.freezeTokens ?? prev.freezeTokens,
      }));

      // optionally: show toast with res.message or res.credits.earned
      // toast.success(res.message || 'Check-in successful');
    } catch (err: any) {
      console.error('Failed to claim streak:', err);
      // you can inspect err.response.status for 409 etc
      setError('Failed to claim daily check-in');
    } finally {
      setClaiming(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    streak,
    loading,
    claiming,
    error,
    reload: load,
    claim,
  };
}

// helper from above
function getUiDayIndexFromDate(date: Date): number {
  const jsDay = date.getDay(); // 0..6
  const map = [6, 0, 1, 2, 3, 4, 5];
  return map[jsDay];
}

function computeActiveDays(
  current: number,
  lastClaimedAt: string | null,
): number[] {
  if (!lastClaimedAt || current <= 0) return [];

  const lastDate = new Date(lastClaimedAt);
  const lastIdx = getUiDayIndexFromDate(lastDate);

  const days: number[] = [];
  const span = Math.min(current, 7);

  for (let i = 0; i < span; i++) {
    const idx = (lastIdx - i + 7) % 7;
    if (!days.includes(idx)) days.push(idx);
  }

  return days;
}
