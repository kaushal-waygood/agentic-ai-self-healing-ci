import apiInstance from '../api';

export type DailyStreakResponse = {
  streak: {
    current: number;
    longest: number;
    lastClaimedAt: string | null;
    freezeTokens?: number;
  };
  canClaimToday: boolean;
};

export const getCredit = async () => {
  const response = await apiInstance.get(`/students/credits`);

  return response;
};

export const earnSocialCredit = async (data: any, meta: any) => {
  console.log('data', data, meta);
  const response = await apiInstance.get(`/students/credit/earn/${data}`, meta);
  return response;
};

export const getTotalCredit = async () => {
  const res = await apiInstance.get('/students/total-credits');
  return res;
};

export async function fetchDailyStreak() {
  const res = await apiInstance.get<DailyStreakResponse>('/students/streaks');
  return res;
}

export async function claimDailyStreakApi() {
  const res = await apiInstance.post('/students/streaks');
  return res;
}
