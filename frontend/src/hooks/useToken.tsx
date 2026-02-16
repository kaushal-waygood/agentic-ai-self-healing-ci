export const getToken = () => {
  // 1. Safety check for SSR: ensure we are in the browser
  if (typeof window === 'undefined') return null;

  try {
    const rootPersist = localStorage.getItem('persist:root');

    if (!rootPersist) return null;

    const parsedRoot = JSON.parse(rootPersist);

    if (parsedRoot.auth) {
      const authData = JSON.parse(parsedRoot.auth);

      if (authData.token) {
        return authData.token;
      }
    }
  } catch (error) {
    console.error('Error retrieving token from localStorage:', error);
    return null;
  }

  return null;
};
