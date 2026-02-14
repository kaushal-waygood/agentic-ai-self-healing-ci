import api from '@/services/api';
import { create } from 'zustand';

export const useAnalyticsStore = create((set) => ({
  analytics: null, // Job Performance Stats
  userAnalytics: null, // User Acquisition Stats
  geminiAnalytics: null, // AI/Token Stats
  loading: false,
  error: null,

  fetchAnalytics: async ({ from, to }: DateRange) => {
    console.log(from, to);
    set({ loading: true, error: null });
    try {
      // Change: Use both parameters in the query string
      const res = await api.get(`/analytics/dashboard?from=${from}&to=${to}`);

      if (res.data.success) {
        set({ analytics: res.data.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchUserAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/analytics/user-dashboard');
      if (res.data.success)
        set({ userAnalytics: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchGeminiAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/analytics/gemini-dashboard');
      if (res.data.success)
        set({ geminiAnalytics: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
