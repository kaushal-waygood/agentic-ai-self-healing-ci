/** @format */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Student = {
  students: any[];
  skills: any[];
  educations: any[];
  projects: any[];
  experiences: any[];
  loading: boolean;
  error: string | null;
};

const initialState: Student = {
  students: [],
  skills: [],
  educations: [],
  projects: [],
  experiences: [],
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

    addStudentEducationRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentEducationSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.educations = action.payload;
    },
    addStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentEducationRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentEducationSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.educations = action.payload;
    },
    removeStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addStudentExperienceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentExperienceSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.experiences = action.payload;
    },
    addStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentExperienceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentExperienceSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.experiences = action.payload;
    },
    removeStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addStudentProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentProjectSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.projects = action.payload;
    },
    addStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentProjectSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.projects = action.payload;
    },
    removeStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addStudentSkillRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentSkillSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.skills = action.payload;
    },
    addStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentSkillRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentSkillSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.skills = action.payload;
    },
    removeStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,

  addStudentEducationRequest,
  addStudentEducationSuccess,
  addStudentEducationFailure,

  removeStudentEducationRequest,
  removeStudentEducationSuccess,
  removeStudentEducationFailure,

  addStudentExperienceRequest,
  addStudentExperienceSuccess,
  addStudentExperienceFailure,

  removeStudentExperienceRequest,
  removeStudentExperienceSuccess,
  removeStudentExperienceFailure,

  addStudentProjectRequest,
  addStudentProjectSuccess,
  addStudentProjectFailure,

  removeStudentProjectRequest,
  removeStudentProjectSuccess,
  removeStudentProjectFailure,

  addStudentSkillRequest,
  addStudentSkillSuccess,
  addStudentSkillFailure,

  removeStudentSkillRequest,
  removeStudentSkillSuccess,
  removeStudentSkillFailure,
} = studentSlice.actions;
export default studentSlice.reducer;
