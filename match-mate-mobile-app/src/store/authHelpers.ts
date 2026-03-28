import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  setToken: async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
    } else {
      await AsyncStorage.setItem('token', token);
    }
  },

  getToken: async (): Promise<string | null> => {
    return Platform.OS === 'web'
      ? localStorage.getItem('token')
      : await AsyncStorage.getItem('token');
  },

  removeToken: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
    } else {
      await AsyncStorage.removeItem('token');
    }
  },
};
