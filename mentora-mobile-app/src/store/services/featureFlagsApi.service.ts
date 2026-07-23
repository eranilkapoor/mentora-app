import { baseApi } from './baseApi.service';

export interface PublicFeatureFlags {
  auth: {
    emailPassword: boolean;
    phoneOtp: boolean;
    magicLink: boolean;
    suspiciousLoginDetection: boolean;
    social: {
      google: boolean;
      facebook: boolean;
      apple: boolean;
    };
  };
  billing: {
    mobileStoreVerificationMode: string;
    strictMobileStoreVerification: boolean;
    googlePlayRtdn: boolean;
  };
  media: {
    aiModeration: boolean;
  };
  monitoring: {
    enabled: boolean;
    provider: string;
  };
  notifications: {
    queue: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    providers: {
      email: string;
      sms: string;
      push: string;
    };
  };
  learning: {
    dailyDigest: boolean;
    dailyDigestDryRun: boolean;
  };
}

export interface FeatureFlagsResponse {
  generatedAt: string;
  flags: PublicFeatureFlags;
}

export const featureFlagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureFlags: builder.query<FeatureFlagsResponse, void>({
      query: () => ({
        url: '/feature-flags',
        method: 'GET',
      }),
      providesTags: ['FeatureFlags'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFeatureFlagsQuery } = featureFlagsApi;
