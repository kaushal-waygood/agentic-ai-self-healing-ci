export interface AuthState {
  isAuthenticated: boolean;
  user: null | {
    _id: string;
    fullName: string;
    email: string;
    token?: string;
    accountType?: string;
    organizationName?: string;
  };
  message: string;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginPayload {
  email: string;

  password: string;
}
