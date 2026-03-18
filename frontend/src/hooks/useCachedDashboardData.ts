'use client';

import { useState, useEffect, useCallback } from 'react';
import apiInstance from '@/services/api';
import {
  getDashboardCache,
  setDashboardCache,
  DASHBOARD_CACHE_KEYS,
} from '@/lib/dashboardCache';

/** Cached fetch for profile status (used by ProfileReadinessCard) */
export function useCachedProfileStatus() {
  const [data, setData] = useState<ProfileCompletionData | null>(() =>
    getDashboardCache<ProfileCompletionData>(
      DASHBOARD_CACHE_KEYS.PROFILE_STATUS,
    ),
  );
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await apiInstance.get('/students/profile/status');
      const result = response.data as ProfileCompletionData;
      setDashboardCache(DASHBOARD_CACHE_KEYS.PROFILE_STATUS, result);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [data, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export interface ProfileCompletionData {
  percentage: number;
  breakdown?: { completed: number; total: number };
  categories?: Record<string, boolean>;
}

/** Cached fetch for student details */
export function useCachedStudentDetails() {
  const [data, setData] = useState<any>(() =>
    getDashboardCache(DASHBOARD_CACHE_KEYS.STUDENT_DETAILS),
  );
  const [isLoading, setIsLoading] = useState(!data);

  const fetchData = useCallback(async () => {
    try {
      const res = await apiInstance.get('/students/details');
      const payload = res.data;
      setDashboardCache(DASHBOARD_CACHE_KEYS.STUDENT_DETAILS, payload);
      setData(payload);
    } catch (e) {
      console.error('Error fetching student details:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [data, fetchData]);

  return { data, isLoading, refetch: fetchData };
}

/** Cached fetch for billing/plan data */
export function useCachedBillingData(enabled = true) {
  // const [data, setData] = useState<any[]>(() =>
  const [data, setData] = useState<any[] | null>(
    () =>
      // getDashboardCache<any[]>(DASHBOARD_CACHE_KEYS.BILLING) ?? [],
      getDashboardCache<any[]>(DASHBOARD_CACHE_KEYS.BILLING) ?? null,
  );
  // const [isLoading, setIsLoading] = useState(!data && enabled);
  const [isLoading, setIsLoading] = useState(enabled && data === null);

  const fetchData = useCallback(async () => {
    try {
      const res = await apiInstance.get('/plan/perchased');
      if (res.data.success) {
        const payload = res.data.data || [];
        setDashboardCache(DASHBOARD_CACHE_KEYS.BILLING, payload);
        setData(payload);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // if (data) {
    if (data !== null) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [data, fetchData, enabled]);

  return { data: data ?? [], isLoading, refetch: fetchData };
}

/** Cached fetch for AI activity */
export function useCachedAIActivity(enabled = true) {
  const [data, setData] = useState<any>(() =>
    getDashboardCache(DASHBOARD_CACHE_KEYS.AI_ACTIVITY),
  );
  const [isLoading, setIsLoading] = useState(!data && enabled);

  const fetchData = useCallback(async () => {
    try {
      const res = await apiInstance.get('/students/ai-activity');
      if (res.data.success) {
        const payload = res.data.data;
        setDashboardCache(DASHBOARD_CACHE_KEYS.AI_ACTIVITY, payload);
        setData(payload);
      }
    } catch (e) {
      console.error('Failed to load recent AI activity', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (data) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [data, fetchData, enabled]);

  return { data, isLoading, refetch: fetchData };
}

/** Cached fetch for top jobs */
export function useCachedTopJobs(enabled = true) {
  const [data, setData] = useState<any[]>(
    () => getDashboardCache<any[]>(DASHBOARD_CACHE_KEYS.TOP_JOBS) ?? [],
  );
  const [isLoading, setIsLoading] = useState(!data && enabled);

  const fetchData = useCallback(async () => {
    try {
      const res = await apiInstance.get('/jobs/dashboard/top-jobs');
      if (res.data?.jobs) {
        const payload = res.data.jobs;
        setDashboardCache(DASHBOARD_CACHE_KEYS.TOP_JOBS, payload);
        setData(payload);
      }
    } catch (e) {
      console.error('Top jobs fetch failed', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (data) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [data, fetchData, enabled]);

  return { data: data ?? [], isLoading, refetch: fetchData };
}
