import { baseApi } from './baseApi.service';
import { ApiResponse } from '@/core/types';

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

export interface KycVerification {
  _id?: string;
  status: KycStatus;
  provider?: 'manual' | 'aadhaar' | 'digilocker' | 'liveness';
  idProofUrl?: string;
  selfieUrl?: string;
  documentType?: string;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
  deletedAt?: string | null;
  anonymizedAt?: string | null;
  retentionReason?: string;
  legalHoldUntil?: string | null;
  source?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  version?: number;
}

export const kycApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKycStatus: builder.query<ApiResponse<KycVerification>, void>({
      query: () => '/verification/me',
      providesTags: ['Profile'],
    }),
    submitKyc: builder.mutation<
      ApiResponse<KycVerification>,
      {
        idProof: { uri: string; name: string; type: string };
        selfie: { uri: string; name: string; type: string };
        documentType?: string;
      }
    >({
      query: ({ idProof, selfie, documentType }) => {
        const body = new FormData();
        body.append('idProof', idProof as unknown as string);
        body.append('selfie', selfie as unknown as string);
        if (documentType) body.append('documentType', documentType);
        return {
          url: '/verification/submit',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Profile'],
    }),
    initiateEkyc: builder.mutation<
      ApiResponse<KycVerification>,
      { provider: 'aadhaar' | 'digilocker'; consentReference?: string }
    >({
      query: (body) => ({
        url: '/verification/ekyc/initiate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetKycStatusQuery,
  useSubmitKycMutation,
  useInitiateEkycMutation,
} = kycApi;
