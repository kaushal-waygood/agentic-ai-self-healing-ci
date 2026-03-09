export const getToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    const rootPersist = localStorage.getItem('persist:root');
    if (!rootPersist) return null;

    const parsedRoot = JSON.parse(rootPersist);
    if (parsedRoot.auth) {
      const authData = JSON.parse(parsedRoot.auth);
      if (authData.token && typeof authData.token === 'string') {
        return authData.token;
      }
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }

  return null;
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    const rootPersist = localStorage.getItem('persist:root');
    if (!rootPersist) return null;

    const parsedRoot = JSON.parse(rootPersist);
    if (parsedRoot.auth) {
      const authData = JSON.parse(parsedRoot.auth);
      return authData.refreshToken && typeof authData.refreshToken === 'string'
        ? authData.refreshToken
        : null;
    }
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }

  return null;
};
