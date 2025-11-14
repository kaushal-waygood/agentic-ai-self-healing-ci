import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { create } from 'lodash';

interface AutopilotState {
  autopilot: any[];
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
      console.log('getAutopilotRequest');
      state.loading = true;
      state.error = null;
    },
    getAutopilotSuccess: (state, action: PayloadAction<any>) => {
      console.log('getAutopilotSuccess', action.payload, state.autopilot);
      state.loading = false;
      state.autopilot = action.payload;
      state.error = null;
    },
    getAutopilotFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createAutopilotRequest: (state) => {
      console.log('createAutopilotRequest');
      state.loading = true;
      state.error = null;
    },
    createAutopilotSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.autopilot = action.payload;
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
