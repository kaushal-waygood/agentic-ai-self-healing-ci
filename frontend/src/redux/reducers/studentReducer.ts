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
  savedJobs: string[];
  resume?: any; // Added missing property
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
  savedJobs: [],
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
    getStudentDetailsSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;

      const responseData = action.payload;
      console.log('Reducer received data:', responseData);

      // Handle the nested structure
      if (Array.isArray(responseData)) {
        state.students = responseData;
      } else if (responseData && responseData.studentDetails) {
        // If it's the nested structure from your API
        state.students = [responseData];
      } else if (responseData) {
        // If it's a single student object
        state.students = [responseData];
      } else {
        state.students = [];
      }

      state.error = null;
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
      state.error = null;
    },
    addStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Education remove
    removeStudentEducationRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentEducationSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.educations = state.educations.filter(
        (edu) => edu._id !== action.payload,
      );
      state.error = null;
    },
    removeStudentEducationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // student Education update
    updateStudentEducationRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentEducationSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const updatedEducation = action.payload;
      state.educations = state.educations.map((edu) =>
        edu._id === updatedEducation._id ? updatedEducation : edu,
      );
      state.error = null;
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
      state.error = null;
    },
    addStudentExperienceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentExperienceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentExperienceSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const updatedExperience = action.payload;
      state.experiences = state.experiences.map((exp) =>
        exp._id === updatedExperience._id ? updatedExperience : exp,
      );
      state.error = null;
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
      state.error = null;
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
      state.error = null;
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
      state.error = null;
    },
    removeStudentProjectFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentProjectSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const updatedProject = action.payload;
      state.projects = state.projects.map((proj) =>
        proj._id === updatedProject._id ? updatedProject : proj,
      );
      state.error = null;
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
      state.error = null;
    },
    addStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeStudentSkillRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeStudentSkillSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.skills = state.skills.filter(
        (skill) => skill._id !== action.payload,
      );
      state.error = null;
    },
    removeStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStudentSkillRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentSkillSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const updatedSkill = action.payload;
      state.skills = state.skills.map((skill) =>
        skill._id === updatedSkill._id ? updatedSkill : skill,
      );
      state.error = null;
    },
    updateStudentSkillFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // job preference
    updateStudentJobPreferenceRequest: (state) => {
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

    getStudentJobPreferenceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getStudentJobPreferenceSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.jobPreference = action.payload;
      state.error = null;
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
      state.error = null;
    },
    getStudentResumeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateJobPreferedByStudentRequest: (state) => {
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

    getAllSavedJobsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllSavedJobsSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.savedJobs = action.payload;
      state.error = null;
    },
    getAllSavedJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error action
    clearError: (state) => {
      state.error = null;
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
  getAllSavedJobsRequest,
  getAllSavedJobsSuccess,
  getAllSavedJobsFailure,
  clearError, // Add this export
} = studentSlice.actions;
export default studentSlice.reducer;
