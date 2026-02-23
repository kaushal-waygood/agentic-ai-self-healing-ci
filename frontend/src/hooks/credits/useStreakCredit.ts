'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import {
  fetchDailyStreakRequest,
  getCreditRequest,
  claimDailyStreakRequest,
  getTotalCreditRequest,
} from '@/redux/reducers/creditReducer';

type StreakState = {
  current: number;
  longest: number;
  lastClaimedAt: string | null;
  activeDays: number[];
  canClaimToday: boolean;
  freezeTokens?: number;
};

export function useDailyStreak() {
  const dispatch = useDispatch();

  const {
    streak: reduxStreak,
    credit,
    loading: creditLoading,
    error: creditError,
    claimCredits,
  } = useSelector((state: RootState) => state.credit);

  useEffect(() => {
    dispatch(fetchDailyStreakRequest());
    dispatch(getTotalCreditRequest());
  }, [dispatch]);

  const streakData = useMemo(() => {
    if (!reduxStreak?.data?.streak) {
      return {
        current: 0,
        longest: 0,
        lastClaimedAt: null,
        activeDays: [],
        canClaimToday: false,
        freezeTokens: 0,
      };
    }

    return {
      current: reduxStreak.data.streak.current,
      longest: reduxStreak.data.streak.longest,
      lastClaimedAt: reduxStreak.data.streak.lastClaimedAt,
      activeDays: computeActiveDays(
        reduxStreak.data.streak.current,
        reduxStreak.data.streak.lastClaimedAt,
      ),
      canClaimToday: reduxStreak.data.canClaimToday,
      freezeTokens: reduxStreak.data.streak.freezeTokens ?? 0,
    };
  }, [reduxStreak]);

  const claim = useCallback(async () => {
    try {
      dispatch(claimDailyStreakRequest());
      dispatch(fetchDailyStreakRequest());
      dispatch(getCreditRequest());
    } catch (err: any) {
      console.error('Failed to claim streak:', err);
    }
  }, [dispatch]);

  return {
    streak: streakData,
    credit,
    loading: creditLoading,
    error: creditError,
    claim,
    claimCredits,
    reduxStreak,
  };
}

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

  return days.sort((a, b) => a - b);
}
