// src/services/tourService.ts
import apiInstance from '@/services/api';
import debounce from 'lodash/debounce';

const API_BASE = '/onboarding/tours';

// export const fetchTourConfig = async () => {
//   const res = await apiInstance.get(`${API_BASE}`);
//   return res.data || {};
// };

export const updateTourProgress = async (
  pageKey: string,
  payload: { currentStep?: number; completed?: boolean },
) => {
  try {
    await apiInstance.post(
      `${API_BASE}/${encodeURIComponent(pageKey)}/progress`,
      payload,
    );
    try {
      localStorage.removeItem(`tour:${pageKey}:backup`);
    } catch {}
  } catch (err) {
    // fallback persist locally
    try {
      const prev = JSON.parse(
        localStorage.getItem(`tour:${pageKey}:backup`) || '{}',
      );
      const merged = {
        ...prev,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`tour:${pageKey}:backup`, JSON.stringify(merged));
    } catch {}
    throw err;
  }
};

export const debouncedUpdateTourProgress = debounce(
  (pageKey: string, payload: any) =>
    updateTourProgress(pageKey, payload).catch(() => {}),
  600,
  { leading: false, trailing: true },
);

export const flushLocalBackup = async (pageKey: string) => {
  try {
    const backupRaw = localStorage.getItem(`tour:${pageKey}:backup`);
    if (!backupRaw) return;
    const payload = JSON.parse(backupRaw);
    await apiInstance.post(
      `${API_BASE}/${encodeURIComponent(pageKey)}/progress`,
      payload,
    );
    localStorage.removeItem(`tour:${pageKey}:backup`);
  } catch (err) {
    // ignore
  }
};
