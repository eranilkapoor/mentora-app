import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiUrl || process.env.API_BASE_URL;

export const httpClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});
