import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

interface UserData {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}
console.log('logRocketAnalytics');

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
    setupLogRocketReact();
  },

  identify: (user: UserData) => {
    if (user?.id) {
      const userData: Record<string, string | number | boolean> = {};

      // Only include defined values
      if (user.name !== undefined) userData.name = user.name;
      if (user.email !== undefined) userData.email = user.email;

      // Spread remaining user properties (filtering out undefined values)
      Object.keys(user).forEach((key) => {
        if (
          key !== 'id' &&
          key !== 'name' &&
          key !== 'email' &&
          user[key] !== undefined
        ) {
          userData[key] = user[key];
        }
      });

      LogRocket.identify(user.id, userData);
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
