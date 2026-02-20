import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type CountDetail = {
  generated: number;
  saved: number;
  total: number;
};
type Resume = {
  html: string;
  htmlCVTitle: string;
};

type CoverLetter = {
  html: string;
  htmlCoverLetterTitle: string;
};
type TailoredDetail = {
  generated: number;
  total: number;
};
type DocumentCounts = {
  cv: CountDetail;
  cl: CountDetail;
  tailored: TailoredDetail;
};
type AI = {
  resume: Resume[];
  coverLetter: CoverLetter[];
  documentCounts: DocumentCounts | null;
  loading: boolean;
  error: string | null;
};

const initialState: AI = {
  resume: [],
  coverLetter: [],
  loading: false,
  documentCounts: null,
  error: null,
};

const AISlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    getDocumentCountsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getDocumentCountsSuccess: (
      state,
      action: PayloadAction<DocumentCounts>,
    ) => {
      state.loading = false;
      state.documentCounts = action.payload;
    },
    getDocumentCountsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

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

    deleteSavedResumeRequest: (
      state,
      _action: PayloadAction<{ cvId: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },

    deleteSavedResumeSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.resume = state.resume.filter(
        (cv: any) => cv._id !== action.payload,
      );
    },

    deleteSavedResumeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteSavedCoverLetterRequest: (
      state,
      _action: PayloadAction<{ clId: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },

    deleteSavedCoverLetterSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.coverLetter = state.coverLetter.filter(
        (cv: any) => cv._id !== action.payload,
      );
    },

    deleteSavedCoverLetterFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    renameSavedResumeRequest: (
      state,
      action: PayloadAction<{ cvId: string; newTitle: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },

    renameSavedResumeSuccess: (
      state,
      action: PayloadAction<{ id: string; title: string }>,
    ) => {
      state.loading = false;
      state.resume = state.resume.map((cv: any) =>
        cv._id === action.payload.id
          ? { ...cv, htmlCVTitle: action.payload.title }
          : cv,
      );
    },

    renameSavedResumeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    renameSavedCoverLetterRequest: (
      state,
      action: PayloadAction<{ clId: string; newTitle: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },

    renameSavedCoverLetterSuccess: (
      state,
      action: PayloadAction<{ clId: string; newTitle: string }>,
    ) => {
      state.loading = false;
      state.coverLetter = state.coverLetter.map((cl: any) =>
        cl._id === action.payload.clId
          ? { ...cl, htmlCoverLetterTitle: action.payload.newTitle }
          : cl,
      );
    },

    renameSavedCoverLetterFailure: (state, action: PayloadAction<string>) => {
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

  deleteSavedResumeRequest,
  deleteSavedResumeSuccess,
  deleteSavedResumeFailure,

  deleteSavedCoverLetterRequest,
  deleteSavedCoverLetterSuccess,
  deleteSavedCoverLetterFailure,

  renameSavedResumeRequest,
  renameSavedResumeSuccess,
  renameSavedResumeFailure,

  renameSavedCoverLetterRequest,
  renameSavedCoverLetterSuccess,
  renameSavedCoverLetterFailure,

  getDocumentCountsRequest,
  getDocumentCountsSuccess,
  getDocumentCountsFailure,
} = AISlice.actions;
export default AISlice.reducer;
