import { create } from 'zustand';
import apiInstance from '@/services/api';

const useOrganisationStore = create((set, get) => ({
  organisation: null,
  orgStats: null,
  loading: false,
  error: null,
  getOrganisationProfile: async () => {
    try {
      set({ loading: true });
      const response = await apiInstance.get('/organization/me');
      set({ organisation: response.data.data, loading: false });
    } catch (error) {
      console.error('Error fetching organisation profile:', error);
      set({ loading: false });
    }
  },

  updateProfile: async (data: any) => {
    try {
      set({ loading: true });
      const response = await apiInstance.patch(
        '/organization/update-profile',
        data,
      );
      // set({ organisation: response.data, loading: false });
      set({ organisation: response.data.data, loading: false });
       return true;
    } catch (error) {
      console.error('Error updating organisation profile:', error);
      set({ loading: false });
       return false;
    }
  },

  uploadLogo: async (file) => {
    try {
      set({ loading: true });
      const formData = new FormData();
      formData.append('org-logo', file);

      // We send this to your update endpoint, or a dedicated logo endpoint if you have one
      const response = await apiInstance.patch(
        '/organization/profile/logo',
        formData,
      );

      set({ organisation: response.data.data, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Logo upload error:', error);
      set({ loading: false });
      return { success: false };
    }
  },

  getOrgStats: async () => {
    try {
      set({ loading: true });
      const response = await apiInstance.get('/organization/stats');
      set({ orgStats: response.data.data, loading: false });
    } catch (error) {
      console.error('Error fetching organisation stats:', error);
      set({ loading: false });
    }
  },

  rejectCandidateApplication: async (appliedJobId: string) => {
    try {
      set({ loading: true });
      const response = await apiInstance.patch(
        `/organization/reject-candidate/${appliedJobId}`,
      );
      set({ organisation: response.data.data, loading: false });
    } catch (error) {
      console.error('Error rejecting candidate application:', error);
      set({ loading: false });
    }
  },

  acceptCandidateApplication: async (appliedJobId: string) => {
    try {
      set({ loading: true });
      const response = await apiInstance.patch(
        `/organization/shortlist-candidate/${appliedJobId}`,
      );
      set({ organisation: response.data.data, loading: false });
    } catch (error) {
      console.error('Error accepting candidate application:', error);
      set({ loading: false });
    }
  },
}));

export { useOrganisationStore };
