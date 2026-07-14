/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
const mockHash = jest.fn((value: string) => Promise.resolve(`hash:${value}`));
const mockCompare = jest.fn((value: string, hash: string) =>
  Promise.resolve(hash === `hash:${value}`),
);
jest.mock('bcryptjs', () => ({ hash: mockHash, compare: mockCompare }));

import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { TwoFactorMethod } from '@/modules/settings/enums/settings-preferences.enums';
import { AuthProvider } from '../enums/auth-provider.enum';
import { AuthTwoFactorService } from './auth-two-factor.service';

describe('AuthTwoFactorService', () => {
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    consumeIfValueMatches: jest.fn(),
    incrementWithExpiry: jest.fn(),
  };
  const userModel = { findById: jest.fn() };
  const securityModel = {
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };
  const otpService = { generate: jest.fn(), verify: jest.fn() };

  let service: AuthTwoFactorService;
  let userId: string;
  let settings: Record<string, any>;
  const verifiedUser = () => ({
    _id: new Types.ObjectId(userId),
    email: 'user@test.com',
    isEmailVerified: true,
    isPhoneVerified: true,
    phone: { countryCode: '+91', phone: '9999999999' },
  });
  const userQuery = (value: unknown) => ({
    lean: () => ({ exec: jest.fn().mockResolvedValue(value) }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new Types.ObjectId().toString();
    settings = {
      _id: new Types.ObjectId(),
      twoFactorEnabled: false,
      twoFactorMethod: TwoFactorMethod.NONE,
      recoveryCodeHashes: [],
    };
    cache.get.mockResolvedValue(null);
    cache.set.mockResolvedValue(undefined);
    cache.del.mockResolvedValue(undefined);
    cache.consumeIfValueMatches.mockResolvedValue(true);
    cache.incrementWithExpiry.mockResolvedValue({
      value: 1,
      ttlSeconds: 300,
    });
    userModel.findById.mockReturnValue(userQuery(verifiedUser()));
    securityModel.findOneAndUpdate.mockResolvedValue(settings);
    securityModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
    otpService.generate.mockResolvedValue({ sent: true });
    otpService.verify.mockReturnValue(true);
    service = new AuthTwoFactorService(
      cache as never,
      userModel as never,
      securityModel as never,
      otpService as never,
    );
  });

  it('reports status and disables invalid SMS/method configurations', async () => {
    await expect(service.getStatus(userId)).resolves.toMatchObject({
      enabled: false,
      method: TwoFactorMethod.NONE,
      authenticatorConfigured: false,
      recoveryCodesRemaining: 0,
    });

    settings.twoFactorEnabled = true;
    settings.twoFactorMethod = TwoFactorMethod.SMS;
    userModel.findById.mockReturnValue(userQuery(null));
    await expect(service.getStatus(userId)).resolves.toMatchObject({
      enabled: false,
      method: TwoFactorMethod.NONE,
    });
    expect(securityModel.updateOne).toHaveBeenCalled();

    settings.twoFactorEnabled = true;
    settings.twoFactorMethod = TwoFactorMethod.SMS;
    settings.recoveryCodeHashes = undefined;
    userModel.findById.mockReturnValue(
      userQuery({ ...verifiedUser(), isPhoneVerified: false }),
    );
    await expect(service.getStatus(userId)).resolves.toMatchObject({
      recoveryCodesRemaining: 0,
    });

    settings.twoFactorEnabled = true;
    settings.twoFactorMethod = 'invalid';
    userModel.findById.mockReturnValue(userQuery(verifiedUser()));
    await service.getStatus(userId);
    expect(settings.twoFactorMethod).toBe(TwoFactorMethod.NONE);
  });

  it('sets up TOTP for verified users and rejects missing/unverified users', async () => {
    userModel.findById.mockReturnValue(userQuery(null));
    await expect(service.setupTotp(userId)).rejects.toMatchObject({
      code: ErrorCode.AUTH_USER_NOT_FOUND,
    });
    userModel.findById.mockReturnValue(
      userQuery({ _id: new Types.ObjectId(userId), isEmailVerified: false }),
    );
    await expect(service.setupTotp(userId)).rejects.toMatchObject({
      code: ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
    });

    userModel.findById.mockReturnValue(userQuery(verifiedUser()));
    await expect(service.setupTotp(userId)).resolves.toMatchObject({
      secret: expect.any(String),
      otpauthUrl: expect.stringContaining('user%40test.com'),
    });
    userModel.findById.mockReturnValue(
      userQuery({
        ...verifiedUser(),
        email: undefined,
        isEmailVerified: false,
      }),
    );
    await expect(service.setupTotp(userId)).resolves.toMatchObject({
      otpauthUrl: expect.stringContaining(userId),
    });
  });

  it('enables TOTP only with the configured valid code and generates recovery codes', async () => {
    settings.totpSecret = undefined;
    await expect(service.enableTotp(userId, '000000')).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    settings.totpSecret = 'JBSWY3DPEHPK3PXP';
    await expect(service.enableTotp(userId, 'bad')).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    const counter = Math.floor(Date.now() / 1000 / 30);
    const code = (service as any).generateTotp(settings.totpSecret, counter);
    await expect(service.enableTotp(userId, code)).resolves.toMatchObject({
      enabled: true,
      method: TwoFactorMethod.AUTHENTICATOR,
      recoveryCodes: expect.any(Array),
    });
    expect(mockHash).toHaveBeenCalledTimes(10);
  });

  it('requests and enables SMS only for verified phones and valid OTPs', async () => {
    userModel.findById.mockReturnValue(userQuery(null));
    await expect(service.requestSmsEnable(userId)).rejects.toMatchObject({
      code: ErrorCode.AUTH_USER_NOT_FOUND,
    });
    userModel.findById.mockReturnValue(
      userQuery({ ...verifiedUser(), isPhoneVerified: false }),
    );
    await expect(service.requestSmsEnable(userId)).rejects.toMatchObject({
      code: ErrorCode.AUTH_PHONE_NOT_VERIFIED,
    });
    userModel.findById.mockReturnValue(userQuery(verifiedUser()));
    await expect(service.requestSmsEnable(userId)).resolves.toEqual({
      sent: true,
    });

    otpService.verify.mockReturnValue(false);
    await expect(service.enableSms(userId, 'bad')).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    otpService.verify.mockReturnValue(true);
    await expect(service.enableSms(userId, '123456')).resolves.toEqual({
      enabled: true,
      method: TwoFactorMethod.SMS,
    });
  });

  it('disables authenticator/SMS configurations with verification safeguards', async () => {
    await expect(service.disable(userId)).resolves.toEqual({
      enabled: false,
      method: TwoFactorMethod.NONE,
    });
    settings.twoFactorEnabled = true;
    settings.twoFactorMethod = TwoFactorMethod.AUTHENTICATOR;
    settings.totpSecret = 'JBSWY3DPEHPK3PXP';
    await expect(service.disable(userId)).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    await expect(service.disable(userId, 'bad')).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    const code = (service as any).generateTotp(
      settings.totpSecret,
      Math.floor(Date.now() / 1000 / 30),
    );
    await expect(service.disable(userId, code)).resolves.toMatchObject({
      enabled: false,
    });
    settings.twoFactorMethod = TwoFactorMethod.SMS;
    await expect(service.disable(userId)).resolves.toMatchObject({
      enabled: false,
    });
  });

  it('regenerates recovery codes only after valid TOTP verification', async () => {
    settings.totpSecret = undefined;
    await expect(
      service.regenerateRecoveryCodes(userId, 'bad'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    settings.totpSecret = 'JBSWY3DPEHPK3PXP';
    const code = (service as any).generateTotp(
      settings.totpSecret,
      Math.floor(Date.now() / 1000 / 30),
    );
    await expect(
      service.regenerateRecoveryCodes(userId, code),
    ).resolves.toMatchObject({
      recoveryCodes: expect.any(Array),
    });
  });

  it('begins authenticator and SMS challenges while rejecting unusable states', async () => {
    await expect(
      service.beginChallenge(userId, AuthProvider.EMAIL, 'login'),
    ).resolves.toBeNull();
    settings.twoFactorEnabled = true;
    settings.twoFactorMethod = 'invalid';
    await expect(
      service.beginChallenge(userId, AuthProvider.EMAIL, 'login'),
    ).resolves.toBeNull();
    settings.twoFactorMethod = TwoFactorMethod.SMS;
    await expect(
      service.beginChallenge(userId, AuthProvider.EMAIL, 'login-phone-otp'),
    ).resolves.toBeNull();
    userModel.findById.mockReturnValue(userQuery(null));
    await expect(
      service.beginChallenge(userId, AuthProvider.EMAIL, 'login'),
    ).resolves.toBeNull();

    userModel.findById.mockReturnValue(userQuery(verifiedUser()));
    await expect(
      service.beginChallenge(userId, AuthProvider.EMAIL, 'login'),
    ).resolves.toMatchObject({
      requiresTwoFactor: true,
      method: TwoFactorMethod.SMS,
      expiresInSeconds: 300,
    });
    expect(otpService.generate).toHaveBeenCalled();
    settings.twoFactorMethod = TwoFactorMethod.AUTHENTICATOR;
    await service.beginChallenge(userId, AuthProvider.GOOGLE, 'social-login');
    expect(cache.set).toHaveBeenCalledWith(
      expect.stringContaining('auth:2fa:'),
      expect.any(String),
      300,
    );
  });

  it('consumes recovery and authenticator challenges once', async () => {
    await expect(
      service.consumeChallenge('missing', 'code'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_SESSION_EXPIRED,
    });
    const authenticatorChallenge = {
      userId,
      provider: AuthProvider.EMAIL,
      source: 'login',
      method: TwoFactorMethod.AUTHENTICATOR,
      createdAt: new Date().toISOString(),
    };
    cache.get.mockResolvedValue(JSON.stringify(authenticatorChallenge));
    settings.recoveryCodeHashes = ['hash:RECOVERY'];
    await expect(
      service.consumeChallenge('challenge', undefined, 'invalid'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_OTP });
    await expect(
      service.consumeChallenge('challenge', undefined, 'recovery'),
    ).resolves.toMatchObject({ userId });
    expect(securityModel.updateOne).toHaveBeenCalledWith(
      { _id: settings._id },
      { $pull: { recoveryCodeHashes: 'hash:RECOVERY' } },
    );

    settings.totpSecret = undefined;
    await expect(
      service.consumeChallenge('challenge', 'bad'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    settings.totpSecret = 'JBSWY3DPEHPK3PXP';
    const code = (service as any).generateTotp(
      settings.totpSecret,
      Math.floor(Date.now() / 1000 / 30),
    );
    await expect(
      service.consumeChallenge('challenge', code),
    ).resolves.toMatchObject({
      method: TwoFactorMethod.AUTHENTICATOR,
    });
    expect(cache.consumeIfValueMatches).toHaveBeenCalledWith(
      'auth:2fa:challenge',
      JSON.stringify(authenticatorChallenge),
    );
    cache.consumeIfValueMatches.mockResolvedValue(false);
    await expect(
      service.consumeChallenge('challenge', code),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_SESSION_EXPIRED });
  });

  it('consumes SMS challenges and rejects malformed/invalid/unknown methods', async () => {
    const challenge = {
      userId,
      provider: AuthProvider.EMAIL,
      source: 'login',
      method: TwoFactorMethod.SMS,
      createdAt: new Date().toISOString(),
    };
    cache.get.mockResolvedValue(JSON.stringify(challenge));
    userModel.findById.mockReturnValue(userQuery({ phone: {} }));
    await expect(service.consumeChallenge('challenge')).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    userModel.findById.mockReturnValue(userQuery(verifiedUser()));
    otpService.verify.mockReturnValue(false);
    await expect(
      service.consumeChallenge('challenge', 'bad'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
    otpService.verify.mockReturnValue(true);
    await expect(
      service.consumeChallenge('challenge', '123456'),
    ).resolves.toMatchObject({
      method: TwoFactorMethod.SMS,
    });
    cache.get.mockResolvedValue(
      JSON.stringify({ ...challenge, method: 'invalid' }),
    );
    await expect(
      service.consumeChallenge('challenge', '123456'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_OTP,
    });
  });

  it('invalidates a challenge after five failed verification attempts', async () => {
    const challenge = {
      userId,
      provider: AuthProvider.EMAIL,
      source: 'login',
      method: TwoFactorMethod.AUTHENTICATOR,
      createdAt: new Date().toISOString(),
    };
    cache.get.mockResolvedValue(JSON.stringify(challenge));
    cache.incrementWithExpiry.mockResolvedValue({
      value: 5,
      ttlSeconds: 120,
    });

    await expect(
      service.consumeChallenge('locked-challenge', 'invalid'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_OTP });
    expect(cache.incrementWithExpiry).toHaveBeenCalledWith(
      'auth:2fa:locked-challenge:attempts',
      300,
    );
    expect(cache.del).toHaveBeenCalledWith('auth:2fa:locked-challenge');
  });

  it('covers identity, phone, Base32, recovery, and challenge helper boundaries', async () => {
    const privateService = service as any;
    expect(() =>
      privateService.assertHasVerifiedIdentity(verifiedUser()),
    ).not.toThrow();
    expect(() =>
      privateService.assertHasVerifiedIdentity({
        isEmailVerified: false,
        isPhoneVerified: true,
        phone: { countryCode: '+91', phone: '1' },
      }),
    ).not.toThrow();
    expect(privateService.getVerifiedPhoneOrThrow(verifiedUser())).toEqual(
      verifiedUser().phone,
    );
    expect(
      privateService.hasVerifiedPhone({ isPhoneVerified: true, phone: {} }),
    ).toBe(false);
    expect(privateService.challengeKey('id')).toBe('auth:2fa:id');
    const encoded = privateService.base32Encode(Buffer.from('hello'));
    expect(privateService.base32Decode(`${encoded}===`)).toEqual(
      Buffer.from('hello'),
    );
    expect(privateService.base32Decode(`!${encoded}`)).toEqual(
      Buffer.from('hello'),
    );
    expect(privateService.base32Encode(Buffer.from([255]))).toBe('74');
    expect(privateService.generateBase32Secret()).toHaveLength(32);
    expect(privateService.generateRecoveryCodes()).toHaveLength(10);
    expect(privateService.verifyTotp('JBSWY3DPEHPK3PXP', 'bad')).toBe(false);
    settings.recoveryCodeHashes = undefined;
    await expect(
      privateService.consumeRecoveryCode(settings, 'none'),
    ).resolves.toBe(false);
  });
});
