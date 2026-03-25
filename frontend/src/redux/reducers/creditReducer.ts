import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type DailyStreakPayload = {
  streak: {
    current: number;
    longest: number;
    lastClaimedAt: string | null;
    freezeTokens?: number;
  };
  canClaimToday: boolean;
};

interface CreditState {
  credit: number;
  claimCredits: any;
  loading: boolean;
  error: string | null;
  // streak: number; // Changed from 'any' to 'number'
  streak: DailyStreakPayload | null;
  canClaimToday: boolean;
  claimingStreak: boolean;
}

const initialState: CreditState = {
  credit: 0,
  // streak: 0,
  streak: null,
  claimCredits: null,
  loading: false,
  error: null,
  canClaimToday: false,
  claimingStreak: false,
};

const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    getCreditRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getCreditSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.error = null;
      state.claimCredits = action.payload;
    },
    getCreditFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    getTotalCreditRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getTotalCreditSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.error = null;
      state.credit = action.payload;
    },
    getTotalCreditFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    earnCreditRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    earnCreditSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.error = null;
      state.claimCredits = action.payload;
    },
    earnCreditFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchDailyStreakRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // fetchDailyStreakSuccess: (state, action: PayloadAction<any>) => {

    fetchDailyStreakSuccess: (
      state,
      action: PayloadAction<DailyStreakPayload>,
    ) => {
      state.loading = false;
      state.error = null;
      state.streak = action.payload; // Fixed: was setting credit instead of streak
    },
    fetchDailyStreakFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    claimDailyStreakRequest: (state) => {
      //  state.loading = true;
      state.claimingStreak = true;
      state.error = null;
    },
    claimDailyStreakSuccess: (
      state,
      action: PayloadAction<DailyStreakPayload>,
    ) => {
      // state.loading = false;
      state.claimingStreak = false;
      state.error = null;
      state.streak = action.payload;
    },
    claimDailyStreakFailure: (state, action: PayloadAction<string>) => {
      //  state.loading = false;
      state.claimingStreak = false;
      state.error = action.payload;
    },
  },
});

export const {
  getCreditRequest,
  getCreditSuccess,
  getCreditFailure,

  getTotalCreditRequest,
  getTotalCreditSuccess,
  getTotalCreditFailure,

  earnCreditRequest,
  earnCreditSuccess,
  earnCreditFailure,

  fetchDailyStreakRequest,
  fetchDailyStreakSuccess,
  fetchDailyStreakFailure,

  claimDailyStreakRequest,
  claimDailyStreakSuccess,
  claimDailyStreakFailure,
} = creditSlice.actions;
export default creditSlice.reducer;
