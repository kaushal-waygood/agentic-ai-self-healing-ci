import LogRocket from 'logrocket';

const logRocketAnalytics = {
  init: () => {
    if (typeof window === 'undefined') return;

    const id = 'jlthnd/zobsai';
    console.log('logRocketAnalytics', id);
    if (!id) return;

    LogRocket.init(id, {
      dom: {
        inputSanitizer: true,
      },
    });
  },

  identify: (user: { id: string; email?: string; name?: string }) => {
    if (!user?.id) return;

    LogRocket.identify(user.id, {
      email: user.email,
      name: user.name,
    });
  },

  captureException: (error: unknown) => {
    if (error instanceof Error) {
      LogRocket.captureException(error);
    }
  },
};

export default logRocketAnalytics;
