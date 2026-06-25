import { SuccessCode } from '@/common/constants';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    exchangeResetPasswordCode: jest.fn(),
    refresh: jest.fn(),
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
});
