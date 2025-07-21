export interface AuthState {
  isAuthenticated: boolean;
  user: null | {
    _id: string;
    name: string;
    email: string;
    token: string;
    accountType: string;
    jobPreference: string;
    organizationName: string;
  };
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}
