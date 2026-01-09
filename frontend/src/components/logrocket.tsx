import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

interface UserData {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

const logRocketAnalytics = {
  init: () => {
    const logRocketId = process.env.NEXT_PUBLIC_LOGROCKET_ID;

    // Safety check: Don't run on server or if ID is missing
    if (typeof window === 'undefined' || !logRocketId) return;

    // Optional: Only run in production to save quota
    // if (process.env.NODE_ENV !== 'production') return;

    LogRocket.init(logRocketId, {
      // Optional security: scrub sensitive input fields
      dom: {
        inputSanitizer: true,
      },
    });

    // Integration for React-specific state logging
    setupLogRocketReact(LogRocket);
  },

  identify: (user: UserData) => {
    if (user?.id) {
      LogRocket.identify(user.id, {
        name: user.name,
        email: user.email,
        ...user,
      });
    }
  },

  captureException: (error: Error, extra?: object) => {
    LogRocket.captureException(error, { extra });
  },

  log: (message: string) => {
    LogRocket.log(message);
  },
};

export default logRocketAnalytics;
