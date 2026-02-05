import { create } from 'zustand';
import apiInstance from '@/services/api';
import { useCandidateStore } from './candidates.store';

interface OrganisationStore {
  organisation: any;
  orgStats: any;
  loading: boolean;
  orgJobStats;
  error: any;
  getOrganisationProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  getOrgStats: () => Promise<void>;
  rejectCandidateApplication: (appliedJobId: string) => Promise<boolean>;
  acceptCandidateApplication: (appliedJobId: string) => Promise<void>;
}

const useOrganisationStore = create<OrganisationStore>((set, get) => ({
  organisation: null,
  orgStats: null,
  orgJobStats: null,
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

  uploadLogo: async (file: File) => {
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

      const candidateStore = useCandidateStore.getState();
      useCandidateStore.setState({
        candidates: {
          ...candidateStore.candidates,
          candidates: candidateStore.candidates.candidates.map((c: any) =>
            c._id === appliedJobId ? { ...c, status: 'REJECTED' } : c,
          ),
        },
      });

      set({ loading: false });
      return true;
    } catch (error) {
      console.error('Error rejecting candidate application:', error);
      set({ loading: false });
      return false;
    }
  },

  acceptCandidateApplication: async (appliedJobId: string) => {
    try {
      set({ loading: true });
      const response = await apiInstance.patch(
        `/organization/shortlist-candidate/${appliedJobId}`,
      );

      const candidateStore = useCandidateStore.getState();
      useCandidateStore.setState({
        candidates: {
          ...candidateStore.candidates,
          candidates: candidateStore.candidates.candidates.map((c: any) =>
            c._id === appliedJobId ? { ...c, status: 'SHORTLISTED' } : c,
          ),
        },
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error accepting candidate application:', error);
      set({ loading: false });
    }
  },

  getOrganisationJobStats: async () => {
    try {
      set({ loading: true });
      const response = await apiInstance.get('/jobs/organization-job-stats');
      set({ orgJobStats: response.data.data, loading: false });
    } catch (error) {
      console.error('Error fetching organisation stats:', error);
      set({ loading: false });
    }
  },
  updateCandidateStatus: async (appliedJobId: string, status: string) => {
    try {
      set({ loading: true });

      // Use a single generic endpoint
      await apiInstance.patch(
        `/organization/update-candidate-status/${appliedJobId}`,
        { status }, // Send the status in the body
      );

      const candidateStore = useCandidateStore.getState();
      useCandidateStore.setState({
        candidates: {
          ...candidateStore.candidates,
          candidates: candidateStore.candidates.candidates.map((c) =>
            c._id === appliedJobId ? { ...c, status: status } : c,
          ),
        },
      });

      set({ loading: false });
      return true;
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      set({ loading: false });
      return false;
    }
  },
}));

export { useOrganisationStore };
