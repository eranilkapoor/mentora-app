import httpClient from '../api/httpClient';

export const AuthService = {
  login: (data: { email: string; password: string }) => httpClient.post('/auth/login', data),
  register: (data: any) => httpClient.post('/auth/register', data),
  sendOtp: (data: any) => httpClient.post('/auth/send-otp', data),
  verifyOtp: (data: any) => httpClient.post('/auth/verify-otp', data),
};
