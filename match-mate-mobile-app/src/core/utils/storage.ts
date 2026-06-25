import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { reportError } from './errorReporter';

const isWeb = Platform.OS === 'web';

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
      reportError(error, {
        source: 'Storage.setItem',
        key,
      });
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
        reportError(new Error('Storage parse error'), {
          source: 'Storage.getItem.parse',
          key,
        });
        return null;
      }
    } catch (error) {
      reportError(error, {
        source: 'Storage.getItem',
        key,
      });
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
      reportError(error, {
        source: 'Storage.removeItem',
        key,
      });
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
      reportError(error, {
        source: 'Storage.clear',
      });
    }
  },
};
