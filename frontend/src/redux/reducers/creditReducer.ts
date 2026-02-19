import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreditState {
  credit: number;
  claimCredits: any;
  loading: boolean;
  error: string | null;
  streak: number; // Changed from 'any' to 'number'
  canClaimToday: boolean;
}

const initialState: CreditState = {
  credit: 0,
  streak: 0,
  claimCredits: null,
  loading: false,
  error: null,
  canClaimToday: false,
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
    fetchDailyStreakSuccess: (state, action: PayloadAction<any>) => {
      // Changed to accept any for streak data
      state.loading = false;
      state.error = null;
      state.streak = action.payload; // Fixed: was setting credit instead of streak
    },
    fetchDailyStreakFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
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
} = creditSlice.actions;
export default creditSlice.reducer;
