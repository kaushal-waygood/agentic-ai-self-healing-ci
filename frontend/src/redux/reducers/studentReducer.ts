/** @format */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/* =========================
   Entity Types
========================= */
export type ID = string;

export interface Education {
  _id: ID;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  country: string;
  gpa?: string;
  startDate: string; // ISO
  endDate?: string; // ISO | undefined
}

export interface Experience {
  _id: ID;
  company: string;
  designation: string;
  employmentType?: string;
  location?: string;
  isCurrent?: boolean;
  startDate: string; // ISO
  endDate?: string; // ISO | undefined
  responsibilities?: string;
}

export interface Project {
  _id: ID;
  projectName: string;
  description: string;
  startDate: string; // ISO
  endDate?: string; // ISO | undefined
  isCurrent?: boolean;
  technologies: string[];
  link?: string;
}

export interface Skill {
  _id: ID;
  skill: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | string;
}

export interface JobPreference {
  // shape as your API returns; keep loose here
  [k: string]: any;
}

export interface StudentProfile {
  _id: ID;
  // add profile fields you actually use
  [k: string]: any;
}

type StudentState = {
  students: StudentProfile[];
  skills: Skill[];
  educations: Education[];
  projects: Project[];
  experiences: Experience[];
  loading: boolean;
  error: string | null;
  jobPreference: JobPreference | null;
  savedJobs: string[]; // keep consistent
  events: any[];
  resume?: any;
};

const initialState: StudentState = {
  students: [],
  skills: [],
  educations: [],
  projects: [],
  experiences: [],
  savedJobs: [],
  jobPreference: null,
  loading: false,
  events: [],
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    /* =========================
       Student details
    ========================= */
    getStudentDetailsRequest: (
      state,
      _action: PayloadAction<void | { id?: ID }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    getStudentDetailsSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const data = action.payload;

      // Normalize common API shapes to StudentProfile[]
      if (Array.isArray(data)) {
        state.students = data as StudentProfile[];
      } else if (data?.studentDetails && Array.isArray(data.studentDetails)) {
        state.students = data.studentDetails as StudentProfile[];
      } else if (data && typeof data === 'object') {
        state.students = [data as StudentProfile];
      } else {
        state.students = [];
      }

      state.error = null;
    },
    getStudentDetailsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Education
    ========================= */
    getStudentEducationRequest: (state, _action: PayloadAction<void>) => {
      state.loading = true;
      state.error = null;
    },
    getStudentEducationSuccess: (state, action: PayloadAction<Education[]>) => {
      state.loading = false;
      state.educations = action.payload;
      state.error = null;
    },
    getStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addStudentEducationRequest: (
      state,
      _action: PayloadAction<Omit<Education, '_id'> | Education>,
    ) => {
      console.log('addStudentEducationRequest');
      state.loading = true;
      state.error = null;
    },
    addStudentEducationSuccess: (state, action: PayloadAction<Education>) => {
      state.loading = false;
      state.educations.educations = [
        ...state.educations.educations,
        action.payload,
      ];
      state.error = null;
    },
    addStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentEducationRequest: (state, _action: PayloadAction<ID>) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentEducationSuccess: (state, action: PayloadAction<ID>) => {
      state.loading = false;
      state.educations.educations = state.educations.educations.filter(
        (e) => e._id !== action.payload,
      );
      state.error = null;
    },
    removeStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentEducationRequest: (
      state,
      _action: PayloadAction<{
        data: Partial<Education> & { _id: ID };
        index: ID;
      }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentEducationSuccess: (
      state,
      action: PayloadAction<Education>,
    ) => {
      state.loading = false;
      const updated = action.payload;
      if (!updated?._id) return;
      state.educations.educations = state.educations.educations.map((e) =>
        e._id === updated._id ? updated : e,
      );
      state.error = null;
    },
    updateStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Experience
    ========================= */
    getStudentExperienceRequest: (state, _action: PayloadAction<void>) => {
      state.loading = true;
      state.error = null;
    },
    getStudentExperienceSuccess: (
      state,
      action: PayloadAction<Experience[]>,
    ) => {
      state.loading = false;
      state.experiences = action.payload;
      state.error = null;
    },
    getStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addStudentExperienceRequest: (
      state,
      _action: PayloadAction<Omit<Experience, '_id'> | Experience>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    addStudentExperienceSuccess: (state, action: PayloadAction<Experience>) => {
      state.loading = false;
      state.experiences.experiences = [
        ...state.experiences.experiences,
        action.payload,
      ];
      state.error = null;
    },
    addStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentExperienceRequest: (
      state,
      _action: PayloadAction<{
        data: Partial<Experience> & { _id: ID };
        index: ID;
      }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentExperienceSuccess: (
      state,
      action: PayloadAction<Experience>,
    ) => {
      state.loading = false;
      const updated = action.payload;
      if (!updated?._id) return;
      state.experiences = state.experiences.map((exp) =>
        exp._id === updated._id ? updated : exp,
      );
      state.error = null;
    },
    updateStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentExperienceRequest: (state, _action: PayloadAction<ID>) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentExperienceSuccess: (state, action: PayloadAction<ID>) => {
      state.loading = false;
      state.experiences.experiences = state.experiences.experiences.filter(
        (exp) => exp._id !== action.payload,
      );
      state.error = null;
    },
    removeStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Projects
    ========================= */
    getAllProjectsRequest: (
      state,
      _action: PayloadAction<void | { studentId?: ID }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    getAllProjectsSuccess: (state, action: PayloadAction<Project[]>) => {
      state.loading = false;
      state.projects = action.payload;
      state.error = null;
    },
    getAllProjectsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addStudentProjectRequest: (
      state,
      _action: PayloadAction<Omit<Project, '_id'> | Project>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    addStudentProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.loading = false;
      state.projects.projects = [...state.projects.projects, action.payload];
      state.error = null;
    },
    addStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentProjectRequest: (state, _action: PayloadAction<ID>) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentProjectSuccess: (state, action: PayloadAction<ID>) => {
      state.loading = false;
      state.projects.projects = state.projects.projects.filter(
        (p) => p._id !== action.payload,
      );
      state.error = null;
    },
    removeStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentProjectRequest: (
      state,
      _action: PayloadAction<{
        data: Partial<Project> & { _id: ID };
        index: ID;
      }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.loading = false;
      const updated = action.payload;
      if (!updated?._id) return;
      state.projects = state.projects.map((p) =>
        p._id === updated._id ? updated : p,
      );
      state.error = null;
    },
    updateStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Skills
    ========================= */
    getStudentSkllsRequest: (state, _action: PayloadAction<void>) => {
      state.loading = true;
      state.error = null;
    },
    getStudentSkllsSuccess: (state, action: PayloadAction<Skill[]>) => {
      state.loading = false;
      state.skills = action.payload;
      state.error = null;
    },
    getStudentSkllsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addStudentSkillRequest: (
      state,
      _action: PayloadAction<Omit<Skill, '_id'> | Skill>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    // addStudentSkillSuccess: (state, action: PayloadAction<Skill>) => {
    //   state.loading = false;
    //   state.skills = [...state.skills, action.payload];
    //   state.error = null;
    // },
    addStudentSkillSuccess: (state, action: PayloadAction<Skill>) => {
      state.loading = false;
      state.skills.skills.push(action.payload);
      state.error = null;
    },

    addStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentSkillRequest: (state, _action: PayloadAction<ID>) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentSkillSuccess: (state, action: PayloadAction<ID>) => {
      state.loading = false;
      state.skills.skills = state.skills.skills.filter(
        (s) => s._id !== action.payload,
      );
      state.error = null;
    },

    // removeStudentSkillSuccess: (state, action: PayloadAction<ID>) => {
    //   state.loading = false;
    //   state.skills.skills = state.skills.skills.filter(
    //     (s) => s._id !== action.payload);
    //   state.error = null;
    // },

    removeStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentSkillRequest: (
      state,
      _action: PayloadAction<{ data: Partial<Skill> & { _id: ID }; index: ID }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentSkillSuccess: (state, action: PayloadAction<Skill>) => {
      state.loading = false;
      const updated = action.payload;
      if (!updated?._id) return;
      state.skills = state.skills.map((s) =>
        s._id === updated._id ? updated : s,
      );
      state.error = null;
    },
    updateStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Job Preference
    ========================= */
    updateStudentJobPreferenceRequest: (
      state,
      _action: PayloadAction<JobPreference>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentJobPreferenceSuccess: (
      state,
      action: PayloadAction<JobPreference>,
    ) => {
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

    getStudentJobPreferenceRequest: (
      state,
      _action: PayloadAction<void | { id?: ID }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    getStudentJobPreferenceSuccess: (
      state,
      action: PayloadAction<JobPreference>,
    ) => {
      state.loading = false;
      state.jobPreference = action.payload;
      state.error = null;
    },
    getStudentJobPreferenceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Resume
    ========================= */
    getStudentResumeRequest: (
      state,
      _action: PayloadAction<void | { id?: ID }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    getStudentResumeSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.resume = action.payload;
      state.error = null;
    },
    getStudentResumeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Saved Jobs
    ========================= */
    getAllSavedJobsRequest: (
      state,
      _action: PayloadAction<void | { page?: number }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    getAllSavedJobsSuccess: (state, action: PayloadAction<string[]>) => {
      state.loading = false;
      state.savedJobs = action.payload; // now typed as string[]
      state.error = null;
    },
    getAllSavedJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateJobPreferedByStudentRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    updateJobPreferedByStudentSuccess: (state) => {
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

    postStudentEventsRequest: (state, _action: PayloadAction<void>) => {
      state.loading = true;
      state.error = null;
    },
    postStudentEventsSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.events = action.payload;
      state.error = null;
    },
    postStudentEventsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    getStudentEventsRequest: (state, _action: PayloadAction<void>) => {
      state.loading = true;
      state.error = null;
    },
    getStudentEventsSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.events = action.payload;
      state.error = null;
    },
    getStudentEventsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* =========================
       Utils
    ========================= */
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,

  // Education
  getStudentEducationRequest,
  getStudentEducationSuccess,
  getStudentEducationFailure,
  addStudentEducationRequest,
  addStudentEducationSuccess,
  addStudentEducationFailure,
  removeStudentEducationRequest,
  removeStudentEducationSuccess,
  removeStudentEducationFailure,
  updateStudentEducationRequest,
  updateStudentEducationSuccess,
  updateStudentEducationFailure,

  // Experience
  getStudentExperienceRequest,
  getStudentExperienceSuccess,
  getStudentExperienceFailure,
  addStudentExperienceRequest,
  addStudentExperienceSuccess,
  addStudentExperienceFailure,
  removeStudentExperienceRequest,
  removeStudentExperienceSuccess,
  removeStudentExperienceFailure,
  updateStudentExperienceRequest,
  updateStudentExperienceSuccess,
  updateStudentExperienceFailure,

  // Project
  getAllProjectsRequest,
  getAllProjectsSuccess,
  getAllProjectsFailure,
  addStudentProjectRequest,
  addStudentProjectSuccess,
  addStudentProjectFailure,
  removeStudentProjectRequest,
  removeStudentProjectSuccess,
  removeStudentProjectFailure,
  updateStudentProjectRequest,
  updateStudentProjectSuccess,
  updateStudentProjectFailure,

  //skills
  getStudentSkllsRequest,
  getStudentSkllsSuccess,
  getStudentSkllsFailure,
  addStudentSkillRequest,
  addStudentSkillSuccess,
  addStudentSkillFailure,
  removeStudentSkillRequest,
  removeStudentSkillSuccess,
  removeStudentSkillFailure,
  updateStudentSkillRequest,
  updateStudentSkillSuccess,
  updateStudentSkillFailure,

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

  getAllSavedJobsRequest,
  getAllSavedJobsSuccess,
  getAllSavedJobsFailure,

  postStudentEventsRequest,
  postStudentEventsSuccess,
  postStudentEventsFailure,

  getStudentEventsRequest,
  getStudentEventsSuccess,
  getStudentEventsFailure,

  clearError,
} = studentSlice.actions;

export default studentSlice.reducer;
