import { create } from 'zustand';
import apiInstance from '@/services/api';

interface CandidateStore {
  candidates: any[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  getCandidates: () => Promise<void>;
  // orgCandidates: () => Promise<void>;
  orgCandidates: (page?: number, limit?: number) => Promise<void>;
  orgCandidatesStats: () => Promise<void>;
  candidatesStats: any;

  loading: boolean;
}

const useCandidateStore = create<CandidateStore>((set, get) => ({
  candidates: [],
  candidatesStats: null,
  meta: null,
  loading: false,

  pagination: { totalCount: 0, totalPages: 0, currentPage: 1 },
  getCandidates: async (jobId: string) => {
    try {
      set({ loading: true });

      const response = await apiInstance.get(
        `/jobs/hosted/jobs/candidates/${jobId}`,
      );

      const { data, meta } = response.data;

      set({
        candidates: data ?? [],
        meta: meta ?? null,
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      set({
        candidates: [],
        meta: null,
      });
    } finally {
      set({ loading: false });
    }
  },

  // ... inside useCandidateStore
  // orgCandidates: async () => {
  //   try {
  //     set({ loading: true });
  //     const response = await apiInstance.get('/jobs/candidates-org');

  //     // Ensure you are setting the array, not the whole response object
  //     // If your API returns { success: true, data: [...] }, use response.data.data
  //     const candidateArray = Array.isArray(response.data.data)
  //       ? response.data.data
  //       : Array.isArray(response.data)
  //         ? response.data
  //         : [];

  //     set({ candidates: candidateArray });
  //   } catch (error) {
  //     console.error('Error fetching candidates:', error);
  //     set({ candidates: [] }); // Fallback to empty array on error
  //   } finally {
  //     set({ loading: false });
  //   }
  // },

  orgCandidates: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });
      const response = await apiInstance.get(
        `/jobs/candidates-org?page=${page}&limit=${limit}`,
      );

      const { data, meta } = response.data; // Destructuring your JSON structure

      set({
        candidates: data || [],
        pagination: {
          totalCount: meta.totalCount || 0,
          totalPages: meta.totalPages || 0,
          currentPage: meta.currentPage || 1,
        },
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      set({ candidates: [] });
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
