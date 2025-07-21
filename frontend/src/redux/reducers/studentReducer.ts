/** @format */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Student = {
  students: any[];
  loading: boolean;
  error: string | null;
};

const initialState: Student = {
  students: [],
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    getStudentDetailsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getStudentDetailsSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.students = action.payload;
    },
    getStudentDetailsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,
} = studentSlice.actions;
export default studentSlice.reducer;
