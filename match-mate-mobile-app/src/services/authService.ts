import httpClient from '../api/httpClient';

interface PersonalData {
    profileFor: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: "male" | "female" | "other";
    religion: string;
    country: string;
    state: string;
    city: string;
}

interface EducationData {
    qualification: string;
    field: string;
    university: string;
    occupation: string;
    annualIncome: string;
}

interface PhysicalData {
    height: string;
    weight: string;
    bodyType: string;
    complexion: string;
}

interface FamilyData {
    fatherName: string;
    motherName: string;
    fatherOccupation: string;
    motherOccupation: string;
    siblings: string;
    familyType: string;
    familyStatus: string;
    familyValues: string;
}

interface PreferencesData {
    ageRange: string;
    heightRange: string;
    qualificationRequired: string;
    religionPref: string;
    castePref: string;
    locationPref: string;
    incomePref: string;
    otherPreferences: string;
}

export const AuthService = {
  login: (data: { 
    email: string,
    password: string 
  }) => httpClient.post('/auth/login', data),
  register: (data: { 
    email: string,
    password: string 
  }) => httpClient.post('/auth/register', data),
  sendOtp: (data: { 
    country_code: string,
    phone: string
  }) => httpClient.post('/auth/send-otp', data),
  verifyOtp: (data: { 
    country_code: string,
    phone: string,
    otp: string
  }) => httpClient.post('/auth/verify-otp', data),
  socialLogin: (data: { 
    provider: string,
    provider_id: string,
    access_token: string
  }) => httpClient.post('/auth/social-login', data),
  forgotPassword: (data: {
    email: string
  }) => httpClient.post('/auth/forgot-password', data),
  onboardingProfile: (data: {
    personal: PersonalData,
    education: EducationData,
    physical: PhysicalData,
    family: FamilyData,
    preferences: PreferencesData
  }) => httpClient.post('/auth/onboarding-profile', data),
};
