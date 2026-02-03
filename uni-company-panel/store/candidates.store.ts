import { create } from 'zustand';
import apiInstance from '@/services/api';

interface CandidateStore {
  candidates: any[];
  getCandidates: () => Promise<void>;
  orgCandidates: () => Promise<void>;
  orgCandidatesStats: () => Promise<void>;
  candidatesStats: any;

  loading: boolean;
}

const useCandidateStore = create<CandidateStore>((set, get) => ({
  candidates: [],
  candidatesStats: null,
  loading: false,
  getCandidates: async (jobId: string) => {
    try {
      set({ loading: true });
      // const response = await apiInstance.get(`/jobs/candidates-organization`);
      const response = await apiInstance.get(
        `/jobs/hosted/jobs/candidates/${jobId}`,
      );
      set({ candidates: response.data });
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      set({ loading: false });
    }
  },

  // ... inside useCandidateStore
  orgCandidates: async () => {
    try {
      set({ loading: true });
      const response = await apiInstance.get('/jobs/candidates-org');

      // Ensure you are setting the array, not the whole response object
      // If your API returns { success: true, data: [...] }, use response.data.data
      const candidateArray = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      set({ candidates: candidateArray });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      set({ candidates: [] }); // Fallback to empty array on error
    } finally {
      set({ loading: false });
    }
  },

  orgCandidatesStats: async () => {
    try {
      set({ loading: true });
      const response = await apiInstance.get(
        '/jobs/organization-candidate-stats',
      );

      set({ candidatesStats: response.data });
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      set({ loading: false });
    }
  },
}));

export { useCandidateStore };
