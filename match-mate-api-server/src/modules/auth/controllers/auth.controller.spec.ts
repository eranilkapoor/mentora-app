import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { buildReq, buildRes } from '../../../test/helpers/mock-factory';

const mockAuthService = () => ({
  register: jest.fn(),
  login: jest.fn(),
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
  socialLogin: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  changePassword: jest.fn(),
  onboardingProfile: jest.fn(),
  verifyUser: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  logoutAll: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: ReturnType<typeof mockAuthService>;

  beforeEach(async () => {
    authService = mockAuthService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Register ───────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should return success response on valid registration', async () => {
      const data = { access_token: 'tok', refreshToken: 'ref' };
      authService.register.mockResolvedValue(data);

      const req = buildReq();
      const res = buildRes();
      const dto = {
        email: 'a@b.com',
        password: 'Pass1234!',
        phone: '+911234567890',
        country_code: '+91',
      };

      const result = await controller.register(
        req as any,
        res as any,
        dto as any,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(authService.register).toHaveBeenCalledWith(req, res, dto);
    });

    it('should return failure response when register throws', async () => {
      authService.register.mockRejectedValue(new Error('Email already exists'));

      const result = await controller.register(
        buildReq() as any,
        buildRes() as any,
        {} as any,
      );
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists');
    });
  });

  // ─── Login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should return success response on valid login', async () => {
      const data = { access_token: 'tok' };
      authService.login.mockResolvedValue(data);

      const result = await controller.login(
        buildReq() as any,
        buildRes() as any,
        {} as any,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should return failure response when login throws', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      const result = await controller.login(
        buildReq() as any,
        buildRes() as any,
        {} as any,
      );
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });

  // ─── Send OTP ───────────────────────────────────────────────────────────────

  describe('sendOtp()', () => {
    it('should return OTP sent response', () => {
      const data = { phone: '+911234567890', otp: '123456' };
      authService.sendOtp.mockReturnValue(data);

      const result = controller.sendOtp({
        country_code: '+91',
        phone: '1234567890',
      } as any);
      expect(result.success).toBe(true);
    });

    it('should return failure when sendOtp throws', () => {
      authService.sendOtp.mockImplementation(() => {
        throw new Error('SMS failure');
      });
      const result = controller.sendOtp({
        country_code: '+91',
        phone: '0000000000',
      } as any);
      expect(result.success).toBe(false);
    });
  });

  // ─── Verify OTP ─────────────────────────────────────────────────────────────

  describe('verifyOtp()', () => {
    it('should return success on valid OTP', async () => {
      authService.verifyOtp.mockResolvedValue({ access_token: 'tok' });

      const result = await controller.verifyOtp(
        buildReq() as any,
        buildRes() as any,
        { country_code: '+91', phone: '1234567890', otp: '123456' } as any,
      );
      expect(result.success).toBe(true);
    });

    it('should return failure on invalid OTP', async () => {
      authService.verifyOtp.mockRejectedValue(new Error('Invalid OTP'));
      const result = await controller.verifyOtp(
        buildReq() as any,
        buildRes() as any,
        {} as any,
      );
      expect(result.success).toBe(false);
    });
  });

  // ─── Social Login ────────────────────────────────────────────────────────────

  describe('socialLogin()', () => {
    it('should return success on social login', async () => {
      authService.socialLogin.mockResolvedValue({
        access_token: 'tok',
        user: {},
      });
      const result = await controller.socialLogin(
        buildReq() as any,
        buildRes() as any,
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  // ─── Password Management ───────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('should call forgotPassword with request and email', async () => {
      authService.forgotPassword.mockResolvedValue({
        message: 'Password reset link sent to email',
      });

      const req = buildReq();
      const result = await controller.forgotPassword(
        req as any,
        {
          email: 'user@test.com',
        } as any,
      );

      expect(result.success).toBe(true);
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        req,
        'user@test.com',
      );
    });
  });

  describe('resetPassword()', () => {
    it('should call resetPassword with request and dto', async () => {
      authService.resetPassword.mockResolvedValue({
        message: 'Password has been reset successfully',
      });

      const req = buildReq();
      const dto = {
        token: 'reset-token',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      };

      const result = await controller.resetPassword(req as any, dto as any);
      expect(result.success).toBe(true);
      expect(authService.resetPassword).toHaveBeenCalledWith(req, dto);
    });
  });

  describe('changePassword()', () => {
    it('should call changePassword for authenticated user', async () => {
      authService.changePassword.mockResolvedValue({
        message: 'Password changed successfully',
      });

      const req = buildReq();
      const dto = {
        oldPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      };

      const result = await controller.changePassword(req as any, dto as any);
      expect(result.success).toBe(true);
      expect(authService.changePassword).toHaveBeenCalledWith(
        req,
        'user-id-1',
        dto,
      );
    });
  });

  describe('onboardingProfile()', () => {
    it('should call onboardingProfile with request, userId, dto, and images', async () => {
      authService.onboardingProfile.mockResolvedValue({
        userId: 'user-id-1',
        isOnboardingCompleted: true,
      });

      const req = buildReq();
      const dto = {
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: '1995-01-01',
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { height: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
      };
      const files = [{ originalname: 'a.jpg' }];

      const result = await controller.onboardingProfile(
        req as any,
        'user-id-1',
        dto as any,
        files as any,
      );

      expect(result.success).toBe(true);
      expect(authService.onboardingProfile).toHaveBeenCalledWith(
        req,
        'user-id-1',
        dto,
        files,
      );
    });
  });

  // ─── Verify User ─────────────────────────────────────────────────────────────

  describe('verifyUser()', () => {
    it('should call verifyUser service method', async () => {
      authService.verifyUser.mockResolvedValue({ isVerified: true });
      const result = await controller.verifyUser('user-id-1');
      expect(authService.verifyUser).toHaveBeenCalledWith('user-id-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ isVerified: true });
    });
  });

  // ─── Logout ──────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should call logout with userId and refreshToken', async () => {
      authService.logout.mockResolvedValue(undefined);
      const req = buildReq();
      await controller.logout(req as any, 'refresh-tok');
      expect(authService.logout).toHaveBeenCalledWith(
        req,
        'user-id-1',
        'refresh-tok',
      );
    });
  });

  describe('logoutAll()', () => {
    it('should call logoutAll with userId', async () => {
      authService.logoutAll.mockResolvedValue(undefined);
      const req = buildReq();
      await controller.logoutAll(req as any);
      expect(authService.logoutAll).toHaveBeenCalledWith(req, 'user-id-1');
    });
  });
});
