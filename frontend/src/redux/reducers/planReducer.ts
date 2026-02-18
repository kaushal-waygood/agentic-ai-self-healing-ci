import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlanState {
  loading: boolean;
  planType: string;
  usageLimits: any;
  fetched: boolean;
  usageData: any;
  error: string | null;
}

const initialState: PlanState = {
  loading: false,
  fetched: false,
  planType: 'free',
  usageLimits: {},
  usageData: {},
  error: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    fetchPlanRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPlanSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.planType = action.payload.planType;
      state.usageLimits = action.payload.usageLimits;
      state.usageData = action.payload.usageData;
      state.fetched = true;
    },
    fetchPlanFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchPlanRequest, fetchPlanSuccess, fetchPlanFailure } =
  planSlice.actions;

export default planSlice.reducer;
