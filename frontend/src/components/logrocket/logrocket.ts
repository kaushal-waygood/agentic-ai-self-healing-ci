import LogRocket from 'logrocket';

let isInitialized = false;

const LOGROCKET_APP_ID = 'jlthnd/zobsai';

const logRocketAnalytics = {
  init() {
    if (typeof window === 'undefined') return;
    if (!LOGROCKET_APP_ID) return;
    if (isInitialized) return;

    LogRocket.init(LOGROCKET_APP_ID, {
      dom: {
        inputSanitizer: true,
      },
    });

    isInitialized = true;
  },

  identify(user: { id: string; email?: string; name?: string }) {
    if (!isInitialized) return;
    if (!user?.id) return;

    LogRocket.identify(user.id, {
      email: user.email,
      name: user.name,
    });
  },

  captureException(error: unknown, extra?: Record<string, unknown>) {
    if (!isInitialized) return;

    if (error instanceof Error) {
      LogRocket.captureException(error, extra);
    }
  },
};

export default logRocketAnalytics;
