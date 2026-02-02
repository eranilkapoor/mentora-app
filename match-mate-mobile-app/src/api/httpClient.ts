import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE = 'http://localhost:3000/api/v1/';//Constants.expoConfig?.extra?.apiUrl || process.env.API_BASE_URL;

// const getDeviceId = () => {
//   let deviceId = localStorage.getItem('deviceId');
//   if (!deviceId) {
//     deviceId = crypto.randomUUID();
//     localStorage.setItem('deviceId', deviceId);
//   }
//   return deviceId;
// };

export const httpClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// httpClient.interceptors.request.use((config) => {
//   config.headers['X-Client-Version'] = process.env.REACT_APP_CLIENT_VERSION || 'unknown';
//   config.headers['X-Platform'] = 'web';
//   config.headers['X-Device-Id'] = getDeviceId();

//   return config;
// });

//export default httpClient