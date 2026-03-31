import AsyncStorage from '@react-native-async-storage/async-storage';
import { isWeb } from './device';

/* ================= Generic Storage ================= */
export const Storage = {
  /* ================= SET ================= */
  setItem: async <T>(key: string, value: T): Promise<void> => {
    try {
      const stringValue = JSON.stringify(value);

      if (isWeb) {
        localStorage.setItem(key, stringValue);
      } else {
        await AsyncStorage.setItem(key, stringValue);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  /* ================= GET ================= */
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const value = isWeb
        ? localStorage.getItem(key)
        : await AsyncStorage.getItem(key);

      if (!value) return null;

      try {
        return JSON.parse(value) as T; // ✅ safe cast
      } catch {
        console.warn(`Storage parse error for key: ${key}`);
        return null;
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};
