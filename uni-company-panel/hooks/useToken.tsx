export const getToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    const rootPersist = localStorage.getItem('auth-storage');
    if (!rootPersist) return null;

    const parsedRoot = JSON.parse(rootPersist);

    // Most persist middlewares wrap data in a 'state' object
    const state = parsedRoot.state;

    if (state && state.token) {
      return state.token;
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }

  return null;
};
