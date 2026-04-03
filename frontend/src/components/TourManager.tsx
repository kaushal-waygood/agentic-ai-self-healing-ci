// src/components/TourManager.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  fetchTourConfig,
  debouncedUpdateTourProgress,
  flushLocalBackup,
} from '@/lib/tourService';

type TourStep = {
  element?: string;
  popover: { title?: string; description?: string; position?: string };
};

interface Props {
  pageKey: string; // e.g. 'cv-generator', 'my-docs-cv'
  startImmediately?: boolean;
  allowRestart?: boolean;
  onComplete?: () => void;
}

/**
 * TourManager
 * - Uses the app-level driver.js stylesheet import from the root layout
 * - Dynamically imports driver.js and adapts to multiple export shapes
 * - Exposes window.__startTourForPage(pageKey, optionalStartIndex)
 * - Debounced progress sync via tourService
 */
export default function TourManager({
  pageKey,
  startImmediately = false,
  allowRestart = true,
  onComplete,
}: Props) {
  const canonicalStepsRef = useRef<TourStep[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const activeDriverRef = useRef<any>(null);

  // Fetch server config & user progress; flush local backup; optionally auto-start
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { tourConfig = {}, userTours = {} } = await fetchTourConfig();
        const canonical = tourConfig?.[pageKey] || [];
        if (!mounted) return;
        canonicalStepsRef.current = canonical;
        const pageState = userTours && userTours[pageKey];
        if (pageState) {
          const idx = Math.max(
            0,
            Math.min(pageState.currentStep || 0, canonical.length - 1),
          );
          setStartIndex(idx);
          setCompleted(Boolean(pageState.completed));
        } else {
          setStartIndex(0);
          setCompleted(false);
        }

        await flushLocalBackup(pageKey);

        if (startImmediately && !pageState?.completed) {
          setTimeout(() => startTour(), 200);
        }
      } catch (err) {
        console.warn(
          'TourManager: failed to fetch tourConfig; falling back',
          err,
        );
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, startImmediately]);

  // Helper to try clean destroy/stop on a driver instance (various API shapes)
  const safeDestroyDriver = async (drv: any) => {
    if (!drv) return;
    try {
      if (typeof drv.destroy === 'function') {
        drv.destroy();
        return;
      }
      if (typeof drv.reset === 'function') {
        drv.reset();
        return;
      }
      if (typeof drv.stop === 'function') {
        drv.stop();
        return;
      }
      if (typeof drv.close === 'function') {
        drv.close();
        return;
      }
      if (drv._driver && typeof drv._driver.destroy === 'function') {
        drv._driver.destroy();
        return;
      }
    } catch (e) {
      // ignore — cleanup should not crash the app
    }
  };

  // Start the tour: tolerant dynamic import and start logic
  async function startTour(customStartIndex?: number) {
    const canonical = canonicalStepsRef.current || [];
    const sIdx =
      typeof customStartIndex === 'number' ? customStartIndex : startIndex || 0;

    if (completed && typeof customStartIndex !== 'number') {
      if (!allowRestart) return;
    }

    const start = Math.max(
      0,
      Math.min(sIdx, Math.max(0, canonical.length - 1)),
    );
    const sliced = canonical.slice(start);

    if (!sliced || sliced.length === 0) return;

    // destroy previous
    try {
      await safeDestroyDriver(activeDriverRef.current);
    } catch (e) {
      /* noop */
    }

    const LAST_ABSOLUTE = canonical.length - 1;
    let onLast = false;

    try {
      // dynamic import to avoid SSR and packaging issues
      const mod = await import('driver.js');
      const DriverExport =
        (mod && (mod as any).default) ||
        (mod && (mod as any).Driver) ||
        (mod && (mod as any).driver) ||
        mod;

      const baseOptions = {
        animate: true,
        showProgress: true,
        smoothScroll: true,
        allowClose: true,
        // fallback callbacks (some builds honor these)
        onHighlighted: (_el: any, _step: any, eventObj: any) => {
          const rel = eventObj?.state?.activeIndex ?? 0;
          const absolute = start + rel;
          onLast = absolute === LAST_ABSOLUTE;
          debouncedUpdateTourProgress(pageKey, { currentStep: absolute });
        },
        onDestroyed: () => {
          if (onLast) {
            setCompleted(true);
            debouncedUpdateTourProgress(pageKey, {
              completed: true,
              currentStep: LAST_ABSOLUTE,
            });
            onComplete?.();
          }
          activeDriverRef.current = null;
        },
      };

      let drvInstance: any = null;

      // Try constructing with `new`
      try {
        drvInstance = new (DriverExport as any)({
          ...baseOptions,
          steps: sliced,
        });
      } catch (errNew) {
        // Try callable factory
        try {
          drvInstance = (DriverExport as any)({
            ...baseOptions,
            steps: sliced,
          });
        } catch (errFactory) {
          // Try create then defineSteps + start
          try {
            drvInstance = new (DriverExport as any)({});
            if (typeof drvInstance.defineSteps === 'function') {
              drvInstance.defineSteps(sliced);
            }
          } catch (err3) {
            console.error('TourManager: failed to instantiate driver.js', err3);
            return;
          }
        }
      }

      if (!drvInstance) return;
      activeDriverRef.current = drvInstance;

      // Start using likely method names
      if (typeof drvInstance.drive === 'function') {
        drvInstance.drive();
        return;
      }
      if (typeof drvInstance.start === 'function') {
        drvInstance.start();
        return;
      }
      if (typeof drvInstance.show === 'function') {
        drvInstance.show();
        return;
      }
      if (typeof drvInstance.open === 'function') {
        drvInstance.open();
        return;
      }
      // If it's a callable that started already, nothing else to do
    } catch (err) {
      console.error('TourManager: dynamic import/start failed', err);
    }
  }

  // Expose global helper for pages/components to start tour manually
  useEffect(() => {
    (window as any).__startTourForPage = (page: string, idx?: number) => {
      if (page === pageKey) startTour(idx);
    };
    return () => {
      try {
        delete (window as any).__startTourForPage;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, startIndex, completed]);

  return null;
}
