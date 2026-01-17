'use client';

import { useEffect } from 'react';
import logRocketAnalytics from '@/components/logrocket/logrocket';

export default function LogRocketProvider() {
  useEffect(() => {
    logRocketAnalytics.init();

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logRocketAnalytics.captureException(
        new Error('Unhandled promise rejection'),
        { reason: event.reason },
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
