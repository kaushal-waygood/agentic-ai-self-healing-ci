import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get } from 'http';

interface OrganizationMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  course: string;
}

interface OrganizationState {
  organizations: any[]; // Consider defining a proper type
  members: OrganizationMember[];
  departments: string[];
  courses: [];
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organizations: [],
  members: [],
  departments: [],
  courses: [],
  loading: false,
  error: null,
};

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    addOrganizationMemberRequest: (
      state,
      _action: PayloadAction<{
        fullName: string;
        email: string;
        role: string;
        department: string;
        course: string;
      }>,
    ) => {
      state.loading = true;
      console.log('Adding organization member request', _action.payload);
      state.error = null;
    },
    addOrganizationMemberSuccess: (
      state,
      action: PayloadAction<OrganizationMember>,
    ) => {
      state.loading = false;
      state.members = [...state.members, action.payload];
    },
    addOrganizationMemberFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    editOrganizationMemberRequest: (
      state,
      _action: PayloadAction<{
        fullName: string;
        email: string;
        role: string;
        department: string;
        course: string;
      }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    editOrganizationMemberSuccess: (
      state,
      action: PayloadAction<OrganizationMember>,
    ) => {
      state.loading = false;
      state.members = [...state.members, action.payload];
    },
    editOrganizationMemberFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    getAllOrganizationMemberRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllOrganizationMembersSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.members = action.payload;
    },
    getAllOrganizationMembersFailure: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteOrganizationMemberRequest: (
      state,
      action: PayloadAction<{ id: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    deleteOrganizationMemberSuccess: (
      state,
      action: PayloadAction<{ id: string }>,
    ) => {
      state.loading = false;
      state.members = state.members.filter(
        (member) => member.id !== action.payload.id,
      );
    },
    deleteOrganizationMemberFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    filterOrganizationMemberRequest: (
      state,
      action: PayloadAction<{ searchTerm: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    filterOrganizationMemberSuccess: (
      state,
      action: PayloadAction<OrganizationMember[]>,
    ) => {
      state.loading = false;
      state.members = action.payload;
    },
    filterOrganizationMemberFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    getAllOrgMembersUniqueDepartmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllOrgMembersUniqueDepartmentsSuccess: (
      state,
      action: PayloadAction<string[]>,
    ) => {
      state.loading = false;
      state.departments = action.payload;
    },
    getAllOrgMembersUniqueDepartmentsFailure: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    getAllOrgMembersUniqueCourseRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllOrgMembersUniqueCourseSuccess: (
      state,
      action: PayloadAction<string[]>,
    ) => {
      state.loading = false;
      state.courses = action.payload;
    },
    getAllOrgMembersUniqueCourseFailure: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addOrganizationMemberRequest,
  addOrganizationMemberSuccess,
  addOrganizationMemberFailure,

  editOrganizationMemberRequest,
  editOrganizationMemberSuccess,
  editOrganizationMemberFailure,

  getAllOrganizationMemberRequest,
  getAllOrganizationMembersSuccess,
  getAllOrganizationMembersFailure,

  deleteOrganizationMemberRequest,
  deleteOrganizationMemberSuccess,
  deleteOrganizationMemberFailure,

  filterOrganizationMemberRequest,
  filterOrganizationMemberSuccess,
  filterOrganizationMemberFailure,

  getAllOrgMembersUniqueDepartmentsRequest,
  getAllOrgMembersUniqueDepartmentsSuccess,
  getAllOrgMembersUniqueDepartmentsFailure,

  getAllOrgMembersUniqueCourseRequest,
  getAllOrgMembersUniqueCourseSuccess,
  getAllOrgMembersUniqueCourseFailure,
} = organizationsSlice.actions;
export default organizationsSlice.reducer;
