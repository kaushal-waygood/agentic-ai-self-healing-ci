import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreditState {
  credit: number;
  loading: boolean;
  error: string | null;
}

const initialState: CreditState = {
  credit: 0,
  loading: false,
  error: null,
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
      state.credit = action.payload;
    },
    getCreditFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { getCreditRequest, getCreditSuccess, getCreditFailure } =
  creditSlice.actions;
export default creditSlice.reducer;
