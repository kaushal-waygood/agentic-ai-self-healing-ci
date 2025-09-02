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
  jobPreference: any;
};

type EducationFormData = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  country: string;
  gpa: string;
  startDate: string;
  endDate: string;
};

const initialState: Student = {
  students: [],
  skills: [],
  educations: [],
  projects: [],
  experiences: [],
  jobPreference: null,
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    // student Details
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

    // student Education add
    addStudentEducationRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentEducationSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.educations = [...state.educations, action.payload];
    },
    addStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Education remove
    removeStudentEducationRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentEducationSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.educations = state.educations.filter(
        (edu) => edu._id !== action.payload,
      );
    },
    removeStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Education update
    updateStudentEducationRequest: (
      state,
      action: PayloadAction<{
        educationId: string;
        eduData: EducationFormData;
      }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentEducationSuccess: (
      state,
      action: PayloadAction<{ id: string; updatedEducation: any }>,
    ) => {
      state.loading = false;
      state.educations = state.educations.map((edu) =>
        edu._id === action.payload.id ? action.payload.updatedEducation : edu,
      );
    },
    updateStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Experience
    addStudentExperienceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentExperienceSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.experiences = [...state.experiences, action.payload];
    },
    addStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentExperienceRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentExperienceSuccess: (
      state,
      action: PayloadAction<{ id: string; updatedExperience: any }>,
    ) => {
      state.loading = false;
      state.experiences = state.experiences.map((exp) =>
        exp._id === action.payload.id ? action.payload.updatedExperience : exp,
      );
    },
    updateStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentExperienceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentExperienceSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.experiences = state.experiences.filter(
        (exp) => exp._id !== action.payload,
      );
    },
    removeStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Projects
    addStudentProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentProjectSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.projects = [...state.projects, action.payload];
    },
    addStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentProjectSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.projects = state.projects.filter(
        (proj) => proj._id !== action.payload,
      );
    },
    removeStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentProjectRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentProjectSuccess: (
      state,
      action: PayloadAction<{ id: string; updatedProject: any }>,
    ) => {
      state.loading = false;
      state.projects = state.projects.map((proj) =>
        proj._id === action.payload.id ? action.payload.updatedProject : proj,
      );
    },
    updateStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Skills
    addStudentSkillRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addStudentSkillSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.skills = [...state.skills, action.payload];
    },
    addStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentSkillRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentSkillSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.skills = state.skills.filter(
        (skill) => skill._id !== action.payload,
      );
    },
    removeStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentSkillRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentSkillSuccess: (
      state,
      action: PayloadAction<{ id: string; updatedSkill: any }>,
    ) => {
      state.loading = false;
      state.skills = state.skills.map((skill) =>
        skill._id === action.payload.id ? action.payload.updatedSkill : skill,
      );
    },
    updateStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // job preference
    updateStudentJobPreferenceRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentJobPreferenceSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.jobPreference = action.payload;
      state.error = null;
    },
    updateStudentJobPreferenceFailure: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    getStudentJobPreferenceRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    getStudentJobPreferenceSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.jobPreference = action.payload;
    },
    getStudentJobPreferenceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Resume
    getStudentResumeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getStudentResumeSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.resume = action.payload;
    },
    getStudentResumeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateJobPreferedByStudentRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    updateJobPreferedByStudentSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = null;
    },
    updateJobPreferedByStudentFailure: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,

  // student Education
  addStudentEducationRequest,
  addStudentEducationSuccess,
  addStudentEducationFailure,
  removeStudentEducationRequest,
  removeStudentEducationSuccess,
  removeStudentEducationFailure,
  updateStudentEducationRequest,
  updateStudentEducationSuccess,
  updateStudentEducationFailure,

  // student Experience
  addStudentExperienceRequest,
  addStudentExperienceSuccess,
  addStudentExperienceFailure,
  removeStudentExperienceRequest,
  removeStudentExperienceSuccess,
  removeStudentExperienceFailure,
  updateStudentExperienceRequest,
  updateStudentExperienceSuccess,
  updateStudentExperienceFailure,

  // student Projects
  addStudentProjectRequest,
  addStudentProjectSuccess,
  addStudentProjectFailure,
  removeStudentProjectRequest,
  removeStudentProjectSuccess,
  removeStudentProjectFailure,
  updateStudentProjectRequest,
  updateStudentProjectSuccess,
  updateStudentProjectFailure,

  // student Skills
  addStudentSkillRequest,
  addStudentSkillSuccess,
  addStudentSkillFailure,
  removeStudentSkillRequest,
  removeStudentSkillSuccess,
  removeStudentSkillFailure,
  updateStudentSkillRequest,
  updateStudentSkillSuccess,
  updateStudentSkillFailure,

  //job preference
  updateStudentJobPreferenceRequest,
  updateStudentJobPreferenceSuccess,
  updateStudentJobPreferenceFailure,

  getStudentJobPreferenceRequest,
  getStudentJobPreferenceSuccess,
  getStudentJobPreferenceFailure,

  getStudentResumeRequest,
  getStudentResumeSuccess,
  getStudentResumeFailure,

  updateJobPreferedByStudentRequest,
  updateJobPreferedByStudentSuccess,
  updateJobPreferedByStudentFailure,
} = studentSlice.actions;
export default studentSlice.reducer;
