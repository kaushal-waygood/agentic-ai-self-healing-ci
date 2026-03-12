import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlanUsage {
  applicationsToday: number;
  dailyLimit: number | string;
  totalApplied: number;
  totalLimit: number | string;
}

interface AutopilotState {
  autopilot: any[] | { agents: any[]; planUsage: PlanUsage | null };
  loading: boolean;
  error: string | null;
}

const initialState: AutopilotState = {
  autopilot: [],
  loading: false,
  error: null,
};

const autopilotSlice = createSlice({
  name: 'autopilot',
  initialState,
  reducers: {
    getAutopilotRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAutopilotSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const payload = action.payload;
      state.autopilot =
        payload && typeof payload === 'object' && 'agents' in payload
          ? payload
          : Array.isArray(payload)
            ? { agents: payload, planUsage: null }
            : { agents: [], planUsage: null };
      state.error = null;
    },
    getAutopilotFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createAutopilotRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createAutopilotSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      // Create returns agentId, not full list; getAutopilotRequest refetches
      if (action.payload?.agents) {
        state.autopilot = action.payload;
      } else if (Array.isArray(action.payload)) {
        state.autopilot = { agents: action.payload, planUsage: null };
      }
      state.error = null;
    },
    createAutopilotFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getAutopilotRequest,
  getAutopilotSuccess,
  getAutopilotFailure,
  createAutopilotRequest,
  createAutopilotSuccess,
  createAutopilotFailure,
} = autopilotSlice.actions;
export default autopilotSlice.reducer;
