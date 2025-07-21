import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import organizationsReducer from './reducers/organizationsReducer';
import jobsReducer from './reducers/jobReducer';
import studentReducer from './reducers/studentReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  organizations: organizationsReducer,
  jobs: jobsReducer,
  student: studentReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export { rootReducer };
