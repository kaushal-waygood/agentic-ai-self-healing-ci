'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import stores from './store';

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  return <Provider store={stores}>{children}</Provider>;
};

export default StoreProvider;
