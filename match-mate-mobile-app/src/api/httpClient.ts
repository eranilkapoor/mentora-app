import axios from 'axios';
import Constants from 'expo-constants';
import { store } from '../store';

const API_BASE =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_BASE_URL;

const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

const httpClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const { token, user } = store.getState().auth;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Client-Version'] =
    process.env.EXPO_PUBLIC_REACT_APP_CLIENT_VERSION ||
    Constants.expoConfig?.extra?.clientVersion ||
    '1.0';
  config.headers['X-Platform'] = 'web';
  config.headers['X-Device-Id'] = getDeviceId();
  config.headers['X-Correlation-Id'] = crypto.randomUUID();
  config.headers['X-Request-Id'] = crypto.randomUUID();

  return config;
});

export default httpClient;
