export interface SendOtpRequest {
  country_code: string;
  phone: string;
}

export interface SendOtpResponse {
  phone: string;
  otp: string;
}

export interface VerifyOtpRequest {
  country_code: string;
  phone: string;
  otp: string;
  referralCode?: string;
}

export interface VerifyOtpResponse {
  user?: {
    userId: string;
    firstName?: string;
    email?: string;

    phone: {
      countryCode: string;
      phone: string;
    };

    isPhoneVerified: boolean;
    isOnboardingCompleted: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
  requiresTwoFactor?: boolean;
  challengeId?: string;
  method?: 'sms' | 'email' | 'authenticator';
  expiresInSeconds?: number;
}
