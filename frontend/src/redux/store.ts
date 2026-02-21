import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { rootReducer } from './rootReducer';
import { rootSaga } from './rootSaga';
import { AuthState } from './types/authType';

const authTransform = createTransform<AuthState, AuthState>(
  (inboundState) => {
    return {
      ...inboundState,
      user: inboundState.user
        ? {
            _id: inboundState.user._id,
            fullName: inboundState.user.fullName,
            email: inboundState.user.email,
            dailyStreak: inboundState.user.dailyStreak,
            role: inboundState.user.role,
            accountType: inboundState.user.accountType,
            organizationName: inboundState.user.organizationName,
            googleAuth: inboundState.user.googleAuth,
          }
        : null,
      message: '',
      error: null,
    };
  },
  (outboundState) => outboundState,
  { whitelist: ['auth'] },
);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  transforms: [authTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export default store;
