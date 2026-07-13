import { ErrorCode, SuccessCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    socialLogin: jest.fn(),
    forgotPassword: jest.fn(),
    exchangeResetPasswordCode: jest.fn(),
    resetPassword: jest.fn(),
    requestMagicLink: jest.fn(),
    verifyMagicLink: jest.fn(),
    getTwoFactorStatus: jest.fn(),
    setupTotp: jest.fn(),
    enableTotp: jest.fn(),
    requestSmsTwoFactor: jest.fn(),
    enableSmsTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
    regenerateRecoveryCodes: jest.fn(),
    verifyTwoFactorChallenge: jest.fn(),
    changePassword: jest.fn(),
    verifyUser: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    listSessions: jest.fn(),
    logoutSession: jest.fn(),
    getRefreshCookieOptions: jest.fn(),
  };

  const logger = {
    error: jest.fn(),
  };

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService as never, logger as never);
  });

  it('registers user and wraps response with auth success code', async () => {
    const req = {} as never;
    const res = {} as never;
    const dto = {
      email: 'user@test.com',
      password: 'Password@123',
      firstName: 'Asha',
      lastName: 'Singh',
      country_code: '+91',
      phone: '9999999999',
    } as never;
    authService.register.mockResolvedValue({ id: 'user-1' });

    const response = await controller.register(req, res, dto);

    expect(authService.register).toHaveBeenCalledWith(req, res, dto);
    expect(response.code).toBe(SuccessCode.AUTH_REGISTERED);
  });

  it('exchanges reset-password code and returns success envelope', async () => {
    const req = {} as never;
    const dto = { code: 'reset-code-1' } as never;
    authService.exchangeResetPasswordCode.mockResolvedValue({
      token: 'reset-token',
    });

    const response = await controller.exchangeResetPasswordCode(req, dto);

    expect(authService.exchangeResetPasswordCode).toHaveBeenCalledWith(
      req,
      'reset-code-1',
    );
    expect(response.code).toBe(SuccessCode.AUTH_LOGIN_SUCCESS);
  });

  it('uses x-refresh-token header when refreshing a session', async () => {
    const req = {
      cookies: {},
      body: {},
      headers: { 'x-refresh-token': 'header-token' },
    } as never;
    const res = {} as never;
    authService.refresh.mockResolvedValue({ accessToken: 'new-access-token' });

    await controller.refresh(req, res);

    expect(authService.refresh).toHaveBeenCalledWith(req, res, 'header-token');
  });

  it('throws when refresh token is missing from all accepted locations', async () => {
    const req = {
      cookies: {},
      body: {},
      headers: {},
    } as never;
    const res = {} as never;

    await expect(controller.refresh(req, res)).rejects.toBeDefined();
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('delegates login, OTP, social, and password recovery operations', async () => {
    const req = { headers: {} } as never;
    const res = {} as never;
    const dto = { country_code: '+91', phone: '9999999999', otp: '123456' };
    const verifyOtpDto = {
      ...dto,
      referralCode: 'REF',
    };

    await controller.login(req, res, {} as never);
    await controller.sendOtp(dto);
    await controller.verifyOtp(req, res, verifyOtpDto);
    await controller.socialLogin(req, res, {} as never);
    await controller.forgotPassword(req, { email: 'a@example.com' });
    await controller.resetPassword(req, {
      token: 't',
      password: 'new',
    } as never);
    await controller.requestMagicLink(req, { email: 'a@example.com' });
    await controller.verifyMagicLink(req, res, { token: 'magic' });

    expect(req).toEqual(expect.objectContaining({ res }));
    expect(authService.sendOtp).toHaveBeenCalledWith('+91', '9999999999');
    expect(authService.verifyOtp).toHaveBeenCalledWith(
      req,
      res,
      '+91',
      '9999999999',
      '123456',
      verifyOtpDto,
    );
    expect(authService.forgotPassword).toHaveBeenCalledWith(
      req,
      'a@example.com',
    );
    expect(authService.requestMagicLink).toHaveBeenCalledWith(
      req,
      'a@example.com',
    );
    expect(authService.verifyMagicLink).toHaveBeenCalledWith(req, res, 'magic');
  });

  it('delegates all two-factor operations', async () => {
    const req = { user: { sub: 'user-1' } } as never;
    const appReq = {} as never;
    const res = {} as never;

    await controller.getTwoFactorStatus(req);
    await controller.setupTotp(req);
    await controller.enableTotp(req, { code: '123456' });
    await controller.requestSmsTwoFactor(req);
    await controller.enableSmsTwoFactor(req, { code: '123456' });
    await controller.disableTwoFactor(req, {});
    await controller.regenerateRecoveryCodes(req, { code: '123456' });
    await controller.verifyTwoFactor(appReq, res, {
      challengeToken: 'c',
    } as never);

    expect(authService.getTwoFactorStatus).toHaveBeenCalledWith('user-1');
    expect(authService.enableTotp).toHaveBeenCalledWith('user-1', '123456');
    expect(authService.disableTwoFactor).toHaveBeenCalledWith(
      'user-1',
      undefined,
    );
    expect(authService.verifyTwoFactorChallenge).toHaveBeenCalledWith(
      appReq,
      res,
      { challengeToken: 'c' },
    );
  });

  it('delegates authenticated password, verification, and session operations', async () => {
    const req = { user: { sub: 'user-1' } } as never;
    const res = { clearCookie: jest.fn() };
    authService.getRefreshCookieOptions.mockReturnValue({ secure: true });

    await controller.changePassword(req, {} as never);
    await controller.verifyUser('user-1');
    await controller.logoutAll(req, res as never);
    await controller.listSessions(req);
    await controller.logoutSession(req, 'session-1');

    expect(authService.changePassword).toHaveBeenCalledWith(req, 'user-1', {});
    expect(authService.verifyUser).toHaveBeenCalledWith('user-1');
    expect(authService.logoutSession).toHaveBeenCalledWith(
      req,
      'user-1',
      'session-1',
    );
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', {
      secure: true,
    });
  });

  it('prefers refresh cookie over body and body over header', async () => {
    const res = {} as never;
    await controller.refresh(
      {
        cookies: { refreshToken: 'cookie' },
        body: { refreshToken: 'body' },
        headers: { 'x-refresh-token': 'header' },
      } as never,
      res,
    );
    await controller.refresh(
      {
        cookies: {},
        body: { refreshToken: 'body' },
        headers: { 'x-refresh-token': 'header' },
      } as never,
      res,
    );
    expect(authService.refresh).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      res,
      'cookie',
    );
    expect(authService.refresh).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      res,
      'body',
    );
  });

  it('normalizes unexpected refresh failures and preserves AppExceptions', async () => {
    const req = {
      cookies: { refreshToken: 'cookie' },
      body: {},
      headers: {},
    } as never;
    authService.refresh.mockRejectedValueOnce('provider failed');
    await expect(controller.refresh(req, {} as never)).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_REFRESH_TOKEN,
    });

    const error = new AppException(
      ErrorCode.AUTH_TOKEN_EXPIRED,
      HttpStatus.UNAUTHORIZED,
    );
    authService.refresh.mockRejectedValueOnce(error);
    await expect(controller.refresh(req, {} as never)).rejects.toBe(error);
  });

  it('logs out, clears cookies, and treats invalid refresh tokens idempotently', async () => {
    const req = {
      cookies: { refreshToken: 'cookie' },
      body: {},
      headers: {},
    } as never;
    const res = { clearCookie: jest.fn() };
    authService.getRefreshCookieOptions.mockReturnValue({ secure: true });

    await controller.logout(req, res as never);
    expect(authService.logout).toHaveBeenCalledWith(req, 'cookie');

    const invalidReq = { cookies: {}, body: {}, headers: {} } as never;
    await expect(
      controller.logout(invalidReq, res as never),
    ).resolves.toMatchObject({
      code: SuccessCode.AUTH_LOGOUT_SUCCESS,
    });
    expect(res.clearCookie).toHaveBeenCalled();
  });

  it('rethrows unexpected logout failures', async () => {
    const error = new Error('database failed');
    authService.logout.mockRejectedValue(error);
    await expect(
      controller.logout(
        { cookies: { refreshToken: 'cookie' }, body: {}, headers: {} } as never,
        { clearCookie: jest.fn() } as never,
      ),
    ).rejects.toBe(error);
  });
});
