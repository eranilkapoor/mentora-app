import { ErrorCode } from '@/common/constants';
import { AuthProvider } from '../enums/auth-provider.enum';
import { AuthPasswordService } from './auth-password.service';

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
  };
  const notificationsService = {
    notify: jest.fn(),
  };

  let service: AuthPasswordService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.getOrThrow.mockReturnValue('https://app.matchmate.test');

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

  it('returns reset token and invalidates one-time code on exchange', async () => {
    cache.get.mockResolvedValue({ token: 'reset-token' });

    const result = await service.exchangeResetPasswordCode({} as never, 'abc');

    expect(cache.get).toHaveBeenCalledWith('auth:password-reset:abc');
    expect(cache.del).toHaveBeenCalledWith('auth:password-reset:abc');
    expect(result).toEqual({ token: 'reset-token' });
  });

  it('rejects code exchange when token mapping does not exist', async () => {
    cache.get.mockResolvedValue(undefined);

    await expect(
      service.exchangeResetPasswordCode({} as never, 'missing-code'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
  });

  it('rejects resetPassword when passwords do not match', async () => {
    await expect(
      service.resetPassword({} as never, {
        token: 'reset-token',
        newPassword: 'new-pass-1',
        confirmPassword: 'new-pass-2',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_PASSWORD_MISMATCH });
  });

  it('rejects forgotPassword for users without email/password account', async () => {
    userRepo.findByProvider.mockResolvedValue({
      _id: 'user-1',
      authAccounts: [{ provider: AuthProvider.GOOGLE }],
    });

    await expect(
      service.forgotPassword({} as never, 'user@example.com'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });
  });

  it('rejects changePassword when old password is incorrect', async () => {
    userRepo.findById.mockResolvedValue({
      _id: 'user-1',
      authAccounts: [
        { provider: AuthProvider.EMAIL, passwordHash: '$2b$10$incorrecthash' },
      ],
      save: jest.fn(),
    });

    await expect(
      service.changePassword({} as never, 'user-1', {
        oldPassword: 'wrong-password',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_OLD_PASSWORD_INCORRECT });
  });
});
