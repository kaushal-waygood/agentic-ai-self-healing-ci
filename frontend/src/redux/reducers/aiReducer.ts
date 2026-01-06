import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Resume = {
  html: string;
  htmlCVTitle: string;
};

type CoverLetter = {
  html: string;
  htmlCoverLetterTitle: string;
};

type AI = {
  resume: Resume[];
  coverLetter: CoverLetter[];
  loading: boolean;
  error: string | null;
};

const initialState: AI = {
  resume: [],
  coverLetter: [],
  loading: false,
  error: null,
};

const AISlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    generateCVByJobDescriptionRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    generateCVByJobDescriptionSuccess: (
      state,
      action: PayloadAction<string[]>,
    ) => {
      state.loading = false;
      state.resume = action.payload;
    },
    generateCVByJobDescriptionFailure: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    savedStudentResumeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    savedStudentResumeSuccess: (state, action: PayloadAction<string[]>) => {
      state.loading = false;
      state.resume = action.payload;
    },
    savedStudentResumeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    savedStudentCoverLetterRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    savedStudentCoverLetterSuccess: (
      state,
      action: PayloadAction<string[]>,
    ) => {
      state.loading = false;
      state.coverLetter = action.payload;
    },
    savedStudentCoverLetterFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  generateCVByJobDescriptionRequest,
  generateCVByJobDescriptionSuccess,
  generateCVByJobDescriptionFailure,

  savedStudentResumeRequest,
  savedStudentResumeSuccess,
  savedStudentResumeFailure,

  savedStudentCoverLetterRequest,
  savedStudentCoverLetterSuccess,
  savedStudentCoverLetterFailure,
} = AISlice.actions;
export default AISlice.reducer;
