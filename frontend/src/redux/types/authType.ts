export interface AuthState {
  isAuthenticated: boolean;
  user: null | {
    _id: string;
    fullName: string;
    email: string;
    token: string;
    accountType: string;
    jobPreference: string;
    organizationName: string;
  };
  message: string;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginPayload {
  email: string;

  password: string;
}
