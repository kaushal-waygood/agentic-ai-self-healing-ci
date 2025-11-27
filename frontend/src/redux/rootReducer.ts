import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import organizationsReducer from './reducers/organizationsReducer';
import jobsReducer from './reducers/jobReducer';
import studentReducer from './reducers/studentReducer';
import aiReducer from './reducers/aiReducer';
import autopilotReducer from './reducers/autopilotReducer';
import creditReducer from './reducers/creditReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  organizations: organizationsReducer,
  jobs: jobsReducer,
  student: studentReducer,
  ai: aiReducer,
  autopilot: autopilotReducer,
  credit: creditReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export { rootReducer };
