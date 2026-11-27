import { create } from 'zustand';
import { secureStore } from '../lib/secure-store';
import { request, config } from '../lib/api';

export interface User {
  id: string;
  email: string;
  image?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  error: null,

  hydrate: async () => {
    try {
      const [token, user] = await Promise.all([
        secureStore.getToken(),
        secureStore.getUser<User>(),
      ]);

      if (token && user) {
        set({
          token,
          user,
          isAuthenticated: true,
          hasCompletedOnboarding: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          isLoading: false,
        });
      }
    } catch (e: any) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        isLoading: false,
      });
    }
  },

  completeOnboarding: async () => {
    set({ hasCompletedOnboarding: true });
  },

  login: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { data } = await request<{
        success: boolean;
        token: string;
        user: User;
        message?: string;
      }>({
        endpoint: '/api/auth/mobile-login',
        baseUrl: config.webUrl,
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success && data.token) {
        await secureStore.setToken(data.token);
        await secureStore.setUser(data.user);

        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          error: null,
        });
        return true;
      }

      set({ error: data.message || 'Login failed' });
      return false;
    } catch (err: any) {
      set({ error: err.message || 'Unable to connect to server' });
      return false;
    }
  },

  register: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { data } = await request<{
        message?: string;
      }>({
        endpoint: '/api/auth/register',
        baseUrl: config.webUrl,
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Auto login upon successful registration
      return await get().login(email, password);
    } catch (err: any) {
      set({ error: err.message || 'Registration failed' });
      return false;
    }
  },

  logout: async () => {
    await secureStore.clearAll();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
