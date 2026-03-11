'use client';

import React, { ReactNode, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import stores from './store';

interface StoreProviderProps {
  children: ReactNode;
}

const AutoLogoutHandler = () => {
  const token = useSelector((state: any) => state.auth?.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    try {
      // Decode JWT payload without a library
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const decoded = JSON.parse(jsonPayload);

      if (decoded.exp) {
        const timeToExpiry = decoded.exp * 1000 - Date.now();

        if (timeToExpiry <= 0) {
          dispatch({ type: 'auth/logoutRequest' });
        } else {
          const timer = setTimeout(() => {
            dispatch({ type: 'auth/logoutRequest' });
          }, timeToExpiry);

          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth token for expiry timer.', e);
      // If token is invalid/unparseable, force logout
      dispatch({ type: 'auth/logoutRequest' });
    }
  }, [token, dispatch]);

  return null;
};

const StoreProvider = ({ children }: StoreProviderProps) => {
  return (
    <Provider store={stores}>
      <AutoLogoutHandler />
      {children}
    </Provider>
  );
};

export default StoreProvider;
