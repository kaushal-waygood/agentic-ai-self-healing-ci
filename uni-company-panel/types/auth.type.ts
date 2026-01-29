export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  accountType: string;
  isEmailVerified: boolean;
  credits: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isLogin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

