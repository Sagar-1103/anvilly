import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'anvilly_auth_token';
const USER_KEY = 'anvilly_user_data';
const ONBOARDING_KEY = 'anvilly_onboarding_completed';

// Web fallback memory cache if run on web simulator
let memoryStorage: Record<string, string> = {};

export const secureStore = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY) || memoryStorage[TOKEN_KEY] || null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('[secureStore] getToken error:', e);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        memoryStorage[TOKEN_KEY] = token;
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (e) {
      console.warn('[secureStore] setToken error:', e);
    }
  },

  async deleteToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        delete memoryStorage[TOKEN_KEY];
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('[secureStore] deleteToken error:', e);
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web') {
        raw = localStorage.getItem(USER_KEY) || memoryStorage[USER_KEY] || null;
      } else {
        raw = await SecureStore.getItemAsync(USER_KEY);
      }
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      const serialized = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, serialized);
        memoryStorage[USER_KEY] = serialized;
        return;
      }
      await SecureStore.setItemAsync(USER_KEY, serialized);
    } catch (e) {
      console.warn('[secureStore] setUser error:', e);
    }
  },

  async clearAll(): Promise<void> {
    await this.deleteToken();
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(USER_KEY);
        delete memoryStorage[USER_KEY];
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('[secureStore] clearAll error:', e);
    }
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return (localStorage.getItem(ONBOARDING_KEY) || memoryStorage[ONBOARDING_KEY]) === 'true';
      }
      const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setCompletedOnboarding(completed: boolean = true): Promise<void> {
    try {
      const val = completed ? 'true' : 'false';
      if (Platform.OS === 'web') {
        localStorage.setItem(ONBOARDING_KEY, val);
        memoryStorage[ONBOARDING_KEY] = val;
        return;
      }
      await SecureStore.setItemAsync(ONBOARDING_KEY, val);
    } catch (e) {
      console.warn('[secureStore] setCompletedOnboarding error:', e);
    }
  },
};
