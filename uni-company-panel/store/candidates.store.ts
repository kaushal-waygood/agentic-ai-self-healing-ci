import { create } from 'zustand';
import apiInstance from '@/services/api';

interface CandidateStore {
  candidates: any;
  getCandidates: (jobId: string) => Promise<void>;
  loading: boolean;
}

const useCandidateStore = create<CandidateStore>((set, get) => ({
  candidates: [],
  loading: false,
  getCandidates: async (jobId: string) => {
    try {
      set({ loading: true });
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
}));

export { useCandidateStore };
