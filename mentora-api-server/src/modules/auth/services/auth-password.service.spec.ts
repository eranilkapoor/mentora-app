/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ErrorCode } from '@/common/constants';
import { ActivityPlatform } from '@/modules/profiles/enums/activity-log.enums';
import { AuthProvider } from '../enums/auth-provider.enum';
import { AuthPasswordService } from './auth-password.service';

const request = (overrides: Record<string, unknown> = {}) =>
  ({
    headers: {},
    ...overrides,
  }) as never;

const createUser = (passwordHash = 'existing-hash') => {
  const account = {
    provider: AuthProvider.EMAIL,
    passwordHash,
  };
  return {
    _id: 'user-1',
    authAccounts: [account],
    save: jest.fn().mockResolvedValue(undefined),
    account,
  };
};

describe('AuthPasswordService', () => {
  const userRepo = {
    findByProvider: jest.fn(),
    findById: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };
  const configService = {
    getOrThrow: jest.fn(),
  };
  const userSessionModel = {
    updateMany: jest.fn(),
  };
  const activityLogModel = {
    create: jest.fn(),
  };
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  };
  const notificationsService = {
    notify: jest.fn(),
    sendSecurityEmail: jest.fn(),
  };

  let service: AuthPasswordService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.getOrThrow.mockReturnValue('https://app.mentora.test');
    jwtService.sign.mockReturnValue('signed-reset-token');
    userSessionModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
    activityLogModel.create.mockResolvedValue({ _id: 'activity-1' });
    cache.set.mockResolvedValue(undefined);
    cache.del.mockResolvedValue(undefined);
    cache.incr.mockResolvedValue(1);
    cache.expire.mockResolvedValue(undefined);
    notificationsService.notify.mockResolvedValue({ _id: 'notification-1' });
    notificationsService.sendSecurityEmail.mockResolvedValue({
      status: 'sent',
    });

    service = new AuthPasswordService(
      userRepo as never,
      jwtService as never,
      configService as never,
      userSessionModel as never,
      activityLogModel as never,
      cache as never,
      notificationsService as never,
    );
  });

  it('sends a one-time password-reset link and records request metadata', async () => {
    const user = createUser();
    userRepo.findByProvider.mockResolvedValue(user);

    await expect(
      service.forgotPassword(
        request({
          ip: '10.0.0.1',
          requestId: 'request-1',
          correlationId: 'correlation-1',
          headers: {
            'x-device-id': 'device-1',
            'user-agent': 'mobile-agent',
            'x-platform': 'IOS',
          },
        }),
        'USER@EXAMPLE.COM',
      ),
    ).resolves.toEqual({ sent: true });

    expect(userRepo.findByProvider).toHaveBeenCalledWith(
      AuthProvider.EMAIL,
      'user@example.com',
    );
    expect(cache.set).toHaveBeenCalledWith(
      expect.stringMatching(/^auth:password-reset:[a-f0-9]{32}$/),
      { token: 'signed-reset-token' },
      900,
    );
    expect(notificationsService.sendSecurityEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        templateKey: 'auth.password_reset',
        message: expect.stringContaining(
          'https://app.mentora.test/reset-password?code=',
        ),
      }),
    );
    expect(notificationsService.notify).not.toHaveBeenCalled();
    expect(activityLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: '10.0.0.1',
        device: 'device-1',
        userAgent: 'mobile-agent',
        platform: ActivityPlatform.IOS,
      }),
    );
  });

  it.each([
    [null],
    [{ _id: 'user-1' }],
    [{ _id: 'user-1', authAccounts: 'invalid' }],
    [{ _id: 'user-1', authAccounts: [{ provider: AuthProvider.GOOGLE }] }],
    [
      {
        _id: 'user-1',
        authAccounts: [{ provider: AuthProvider.EMAIL }],
      },
    ],
  ])(
    'returns the same forgot-password result for a missing email account',
    async (user) => {
      userRepo.findByProvider.mockResolvedValue(user);

      await expect(
        service.forgotPassword(request(), 'user@example.com'),
      ).resolves.toEqual({ sent: true });
    },
  );

  it('maps unexpected forgot-password failures to email service failure', async () => {
    userRepo.findByProvider.mockRejectedValue(
      new Error('database unavailable'),
    );

    await expect(
      service.forgotPassword(request(), 'user@example.com'),
    ).rejects.toMatchObject({ code: ErrorCode.EMAIL_SERVICE_FAILED });
  });

  it('returns reset token and invalidates one-time code on exchange', async () => {
    cache.get.mockResolvedValue({ token: 'reset-token' });

    const result = await service.exchangeResetPasswordCode(request(), ' abc ');

    expect(cache.get).toHaveBeenCalledWith('auth:password-reset:abc');
    expect(cache.del).toHaveBeenCalledWith('auth:password-reset:abc');
    expect(result).toEqual({ token: 'reset-token' });
  });

  it.each([undefined, {}, { token: '' }])(
    'rejects code exchange without a mapped token',
    async (cachedValue) => {
      cache.get.mockResolvedValue(cachedValue);

      await expect(
        service.exchangeResetPasswordCode(request(), 'missing-code'),
      ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
    },
  );

  it.each([
    [request(), undefined],
    [request({ correlationId: 'correlation-1' }), 'correlation-1'],
  ])(
    'maps cache failures and conditionally includes correlation ID',
    async (req, correlationId) => {
      cache.get.mockRejectedValue(new Error('cache unavailable'));

      await expect(
        service.exchangeResetPasswordCode(req, 'code'),
      ).rejects.toMatchObject({
        code: ErrorCode.AUTH_INVALID_TOKEN,
        meta: expect.objectContaining(correlationId ? { correlationId } : {}),
      });
    },
  );

  it('rejects resetPassword when passwords do not match', async () => {
    await expect(
      service.resetPassword(request(), {
        token: 'reset-token',
        newPassword: 'new-pass-1',
        confirmPassword: 'new-pass-2',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_PASSWORD_MISMATCH });
  });

  it.each([[undefined], [{}], [{ userId: 'user-1', type: 'wrong-type' }]])(
    'rejects invalid password-reset JWT payloads',
    async (payload) => {
      jwtService.verify.mockReturnValue(payload);

      await expect(
        service.resetPassword(request(), {
          token: 'reset-token',
          newPassword: 'NewPassword@123',
          confirmPassword: 'NewPassword@123',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
    },
  );

  it.each([
    [null],
    [{ _id: 'user-1', authAccounts: [{ provider: AuthProvider.GOOGLE }] }],
  ])('rejects reset for users without an email password', async (user) => {
    jwtService.verify.mockReturnValue({
      userId: 'user-1',
      type: 'password-reset',
      jti: 'reset-jti',
    });
    userRepo.findById.mockResolvedValue(user);

    await expect(
      service.resetPassword(request(), {
        token: 'reset-token',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });
  });

  it('resets a password, revokes sessions, and records fallback request metadata', async () => {
    const user = createUser();
    jwtService.verify.mockReturnValue({
      userId: 'user-1',
      type: 'password-reset',
      jti: 'reset-jti',
    });
    userRepo.findById.mockResolvedValue(user);

    await expect(
      service.resetPassword(
        request({
          headers: {
            'x-forwarded-for': ['10.0.0.2'],
            'x-device-id': ['device-2'],
            'user-agent': ['web-agent'],
            'x-platform': 'ANDROID',
          },
        }),
        {
          token: 'reset-token',
          newPassword: 'NewPassword@123',
          confirmPassword: 'NewPassword@123',
        },
      ),
    ).resolves.toEqual({ changed: true });

    expect(user.account.passwordHash).not.toBe('existing-hash');
    expect(user.save).toHaveBeenCalled();
    expect(userSessionModel.updateMany).toHaveBeenCalledWith(
      { userId: 'user-1' },
      expect.objectContaining({
        isActive: false,
        loggedOutAt: expect.any(Date),
      }),
    );
    expect(activityLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: '10.0.0.2',
        device: 'device-2',
        userAgent: 'web-agent',
        platform: ActivityPlatform.ANDROID,
      }),
    );
  });

  it.each([new BadRequestException(), new UnauthorizedException()])(
    'preserves framework reset-password exceptions',
    async (error) => {
      jwtService.verify.mockImplementation(() => {
        throw error;
      });

      await expect(
        service.resetPassword(request(), {
          token: 'reset-token',
          newPassword: 'NewPassword@123',
          confirmPassword: 'NewPassword@123',
        }),
      ).rejects.toBe(error);
    },
  );

  it('maps unknown reset failures to invalid token', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    await expect(
      service.resetPassword(request(), {
        token: 'reset-token',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
  });

  it('rejects changePassword when passwords do not match', async () => {
    await expect(
      service.changePassword(request(), 'user-1', {
        oldPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'DifferentPassword@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_PASSWORD_MISMATCH });
  });

  it.each([
    [null],
    [{ _id: 'user-1', authAccounts: [{ provider: AuthProvider.GOOGLE }] }],
  ])('rejects password changes without an email password', async (user) => {
    userRepo.findById.mockResolvedValue(user);

    await expect(
      service.changePassword(request(), 'user-1', {
        oldPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });
  });

  it('rejects changePassword when old password is incorrect', async () => {
    const oldHash = await bcrypt.hash('OldPassword@123', 4);
    userRepo.findById.mockResolvedValue(createUser(oldHash));

    await expect(
      service.changePassword(request(), 'user-1', {
        oldPassword: 'WrongPassword@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_OLD_PASSWORD_INCORRECT });
  });

  it('changes a password and defaults invalid headers and platform to web', async () => {
    const oldHash = await bcrypt.hash('OldPassword@123', 4);
    const user = createUser(oldHash);
    userRepo.findById.mockResolvedValue(user);

    await expect(
      service.changePassword(
        request({
          headers: {
            'x-forwarded-for': 42,
            'x-device-id': [],
            'user-agent': [42],
            'x-platform': [],
          },
        }),
        'user-1',
        {
          oldPassword: 'OldPassword@123',
          newPassword: 'NewPassword@123',
          confirmPassword: 'NewPassword@123',
        },
      ),
    ).resolves.toEqual({ changed: true });

    expect(user.save).toHaveBeenCalled();
    expect(notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: ['in_app', 'email'],
        metadata: { source: 'change-password' },
      }),
    );
    expect(activityLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: undefined,
        device: undefined,
        userAgent: undefined,
        platform: ActivityPlatform.WEB,
      }),
    );
  });

  it('maps an unknown explicit platform to web', async () => {
    const user = createUser();
    userRepo.findByProvider.mockResolvedValue(user);

    await service.forgotPassword(
      request({ headers: { 'x-platform': 'desktop' } }),
      'user@example.com',
    );

    expect(activityLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ platform: ActivityPlatform.WEB }),
    );
  });

  it('maps unexpected password-change failures to invalid password', async () => {
    userRepo.findById.mockRejectedValue(new Error('database unavailable'));

    await expect(
      service.changePassword(request(), 'user-1', {
        oldPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_PASSWORD });
  });
});
