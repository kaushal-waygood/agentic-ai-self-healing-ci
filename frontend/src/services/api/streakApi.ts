// lib/streakApi.ts
import apiInstance from '../api'; // whatever path you use

export type DailyStreakResponse = {
  streak: {
    current: number;
    longest: number;
    lastClaimedAt: string | null;
    freezeTokens?: number;
  };
  canClaimToday: boolean;
};

export async function fetchDailyStreak() {
  const res = await apiInstance.get<DailyStreakResponse>('/students/streaks');
  return res.data;
}

export async function claimDailyStreakApi() {
  const res = await apiInstance.post('/students/streaks');
  return res.data;
}
