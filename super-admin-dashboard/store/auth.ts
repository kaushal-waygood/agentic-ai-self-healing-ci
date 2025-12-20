import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiInstance from '@/services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  accountType: string;
  isEmailVerified: boolean;
  credits: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isLogin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isLogin: false,

      login: async ({ email, password }) => {
        try {
          set({ loading: true, error: null });

          const response = await apiInstance.post('/user/signin', {
            email,
            password,
          });

          const data = response.data;
          const fullUser = data.user;

          const sanitizedUser: User = {
            id: fullUser._id,
            fullName: fullUser.fullName,
            email: fullUser.email,
            role: fullUser.role,
            accountType: fullUser.accountType,
            isEmailVerified: fullUser.isEmailVerified,
            credits: fullUser.credits,
          };

          const accessToken = data.accessToken;

          set({
            user: sanitizedUser,
            token: accessToken,
            loading: false,
            isLogin: true,
            error: null,
          });
        } catch (err: unknown | string) {
          console.error('Login Error:', err);
          set({
            error: err.response?.data?.message || err.message || 'Login failed',
            loading: false,
          });
        }
      },

      logout: () => {
        try {
          set({
            user: null,
            token: null,
            loading: false,
            error: null,
            isLogin: false,
          });
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.log('Logout error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
