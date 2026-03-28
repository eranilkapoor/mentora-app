import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';

type ExpoExtra = {
  apiUrl?: string;
  clientVersion?: string;
};

const extra = Constants.expoConfig?.extra as ExpoExtra | undefined;
const API_BASE: string =
  extra?.apiUrl ?? (process.env.EXPO_PUBLIC_API_BASE_URL as string) ?? '';

// ✅ Universal UUID generator (no crypto dependency)
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getDeviceId = async (): Promise<string> => {
  try {
    if (Platform.OS === 'web') {
      let deviceId: string | null = localStorage.getItem('deviceId');

      if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem('deviceId', deviceId);
      }

      return deviceId;
    }

    // 📱 Mobile
    let deviceId: string | null = await AsyncStorage.getItem('deviceId');

    if (!deviceId) {
      deviceId = generateUUID();
      await AsyncStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('DeviceId error:', error);
    return generateUUID(); // fallback
  }
};

const httpClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const { token } = store.getState().auth;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Client-Version'] =
    extra?.clientVersion ??
    (process.env.EXPO_PUBLIC_REACT_APP_CLIENT_VERSION as string) ??
    '1.0';
  config.headers['X-Platform'] = 'web';
  config.headers['X-Device-Id'] = getDeviceId();
  config.headers['X-Correlation-Id'] = generateUUID();
  config.headers['X-Request-Id'] = generateUUID();

  return config;
});

export default httpClient;
