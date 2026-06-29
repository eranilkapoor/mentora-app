import { VerificationSchema } from './verification.schema';

describe('VerificationSchema', () => {
  it('keeps identity review status as the only verification outcome', () => {
    expect(VerificationSchema.path('status')).toBeDefined();
    expect(VerificationSchema.path('verifiedAt')).toBeDefined();
    expect(VerificationSchema.path('isVerified')).toBeUndefined();
    expect(VerificationSchema.path('isProfileVerified')).toBeUndefined();
    expect(VerificationSchema.path('isEmailVerified')).toBeUndefined();
    expect(VerificationSchema.path('isPhoneVerified')).toBeUndefined();
  });
});
