import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UserRepository } from '../repositories/user.repository';
import { AuthTokenService } from './auth-token.service';
import { OtpService } from './otp.service';
import { ProfileService } from '../../profile/profile.service';
import { StorageService } from '../../storage/storage.service';
import { UserSession } from '../schemas/user-session.schema';
import { CACHE_SERVICE } from 'src/modules/cache/cache.interface';
import { Subscription } from '../../subscription/schemas/subscription.schema';
import { Plan } from '../../plan/schemas/plan.schema';
import { ActivityLog } from '../../profile/schemas/settings/activity-logs.schema';
import { NotificationService } from '../../notification/notification.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import {
  mockCacheService,
  mockAuthTokenService,
  mockJwtService,
  mockStorageService,
  mockProfileService,
  mockAnalyticsService,
  buildReq,
  buildRes,
} from 'src/test/helpers/mock-factory';

const mockUserRepository = () => ({
  findByProvider: jest.fn(),
  findByIdWithRoles: jest.fn(),
  findById: jest.fn(),
  findByPhone: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateMembership: jest.fn(),
  findByIdWithSocialAccounts: jest.fn(),
});

const mockOtpService = () => ({
  generate: jest.fn(),
  verify: jest.fn(),
});

const mockUserSessionModel = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
});

const mockPlanModel = () => ({
  findOne: jest.fn().mockReturnThis(),
  exec: jest.fn(),
});

const mockSubscriptionModel = () => ({
  findOneAndUpdate: jest.fn(),
});

const mockActivityLogModel = () => ({
  create: jest.fn(),
});

const mockNotificationService = () => ({
  notify: jest.fn().mockResolvedValue({}),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof mockUserRepository>;
  let authTokenService: ReturnType<typeof mockAuthTokenService>;
  let otpService: ReturnType<typeof mockOtpService>;
  let cacheService: ReturnType<typeof mockCacheService>;
  let userSessionModel: ReturnType<typeof mockUserSessionModel>;
  let planModel: ReturnType<typeof mockPlanModel>;
  let subscriptionModel: ReturnType<typeof mockSubscriptionModel>;
  let activityLogModel: ReturnType<typeof mockActivityLogModel>;
  let notificationService: ReturnType<typeof mockNotificationService>;
  let analyticsService: ReturnType<typeof mockAnalyticsService>;

  beforeEach(async () => {
    userRepo = mockUserRepository();
    authTokenService = mockAuthTokenService();
    otpService = mockOtpService();
    cacheService = mockCacheService();
    userSessionModel = mockUserSessionModel();
    planModel = mockPlanModel();
    subscriptionModel = mockSubscriptionModel();
    activityLogModel = mockActivityLogModel();
    notificationService = mockNotificationService();
    analyticsService = mockAnalyticsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepo },
        { provide: AuthTokenService, useValue: authTokenService },
        { provide: JwtService, useValue: mockJwtService() },
        { provide: OtpService, useValue: otpService },
        { provide: ProfileService, useValue: mockProfileService() },
        { provide: StorageService, useValue: mockStorageService() },
        { provide: CACHE_SERVICE, useValue: cacheService },
        {
          provide: getModelToken(UserSession.name),
          useValue: userSessionModel,
        },
        { provide: getModelToken(Plan.name), useValue: planModel },
        {
          provide: getModelToken(Subscription.name),
          useValue: subscriptionModel,
        },
        {
          provide: getModelToken(ActivityLog.name),
          useValue: activityLogModel,
        },
        { provide: NotificationService, useValue: notificationService },
        { provide: AnalyticsService, useValue: analyticsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Register ────────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should throw ConflictException when email already exists', async () => {
      userRepo.findByProvider.mockResolvedValue({ _id: 'existing-id' });

      await expect(
        service.register(
          buildReq() as any,
          buildRes() as any,
          {
            email: 'dup@test.com',
            password: 'Pass1234!',
          } as any,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens on successful registration', async () => {
      userRepo.findByProvider.mockResolvedValue(null);
      planModel.exec.mockResolvedValue({
        _id: 'plan-id-1',
        durationDays: 30,
      });
      const savedUser = {
        _id: { toString: () => 'user-id-1' },
        email: 'new@test.com',
        authAccounts: [],
      };
      userRepo.create.mockResolvedValue(savedUser);
      const populatedUser = {
        _id: { toString: () => 'user-id-1' },
        email: 'new@test.com',
        roles: [],
      };
      userRepo.findByIdWithRoles.mockResolvedValue(populatedUser);
      authTokenService.generatePayload.mockReturnValue({
        sub: 'user-id-1',
        email: 'new@test.com',
      });
      authTokenService.generateTokens.mockReturnValue({
        accessToken: 'acc-tok',
        refreshToken: 'ref-tok',
      });
      userSessionModel.create.mockResolvedValue({});
      cacheService.set.mockResolvedValue(undefined);
      subscriptionModel.findOneAndUpdate.mockResolvedValue({});
      userRepo.updateMembership.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.register(
        buildReq({ headers: { 'x-platform': 'mobile' } }) as any,
        buildRes() as any,
        { email: 'new@test.com', password: 'Pass1234!' } as any,
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(subscriptionModel.findOneAndUpdate).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalled();
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });
  });

  // ─── Password Management ───────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('should send reset link only for email-registered user', async () => {
      userRepo.findByProvider.mockResolvedValue({
        _id: 'user-id-1',
        authAccounts: [{ provider: 'email', passwordHash: 'hash' }],
      });
      notificationService.notify.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});

      const result = await service.forgotPassword(
        buildReq() as any,
        'user@test.com',
      );

      expect(result).toHaveProperty(
        'message',
        'Password reset link sent to email',
      );
      expect(notificationService.notify).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'password_reset_request' }),
      );
    });
  });

  describe('resetPassword()', () => {
    it('should reset password and notify user', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      (service as any).jwtService.verify = jest.fn().mockReturnValue({
        userId: 'user-id-1',
        type: 'password-reset',
      });
      userRepo.findById.mockResolvedValue({
        _id: 'user-id-1',
        authAccounts: [{ provider: 'email', passwordHash: 'old-hash' }],
        save,
      });
      userSessionModel.updateMany.mockResolvedValue({ modifiedCount: 2 });
      notificationService.notify.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});

      const result = await service.resetPassword(
        buildReq() as any,
        {
          token: 'reset-token',
          newPassword: 'NewPass123!',
          confirmPassword: 'NewPass123!',
        } as any,
      );

      expect(result).toHaveProperty(
        'message',
        'Password has been reset successfully',
      );
      expect(save).toHaveBeenCalled();
      expect(userSessionModel.updateMany).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'password_reset_success' }),
      );
    });
  });

  describe('changePassword()', () => {
    it('should change password for logged-in email user', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      userRepo.findById.mockResolvedValue({
        _id: 'user-id-1',
        authAccounts: [{ provider: 'email', passwordHash: '$2a$10$oldhash' }],
        save,
      });
      notificationService.notify.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});

      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);

      const result = await service.changePassword(
        buildReq() as any,
        'user-id-1',
        {
          oldPassword: 'OldPass123!',
          newPassword: 'NewPass123!',
          confirmPassword: 'NewPass123!',
        } as any,
      );

      expect(result).toHaveProperty('message', 'Password changed successfully');
      expect(save).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'change_password' }),
      );
    });
  });

  // ─── Onboarding Profile ────────────────────────────────────────────────────

  describe('onboardingProfile()', () => {
    it('should create profile, mark onboarding complete, and emit notifications and tracking', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      userRepo.findById.mockResolvedValue({
        _id: 'user-id-1',
        email: 'user@test.com',
        phone: { phone: '1234567890' },
        isOnboardingCompleted: false,
        save,
      });
      const moduleRef = service as unknown as {
        storageService: { uploadFiles: jest.Mock };
        profileService: { createProfile: jest.Mock };
      };
      moduleRef.storageService.uploadFiles.mockResolvedValue([
        { filename: 'img-1.jpg', url: 'https://cdn/img-1.jpg' },
      ]);
      moduleRef.profileService.createProfile.mockResolvedValue({
        userId: 'user-id-1',
      });
      notificationService.notify.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.onboardingProfile(
        buildReq({ headers: { 'x-platform': 'web' } }) as any,
        'user-id-1',
        {
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
        } as any,
        [{ originalname: 'img-1.jpg' }] as any,
      );

      expect(result).toEqual({
        userId: 'user-id-1',
        isOnboardingCompleted: true,
      });
      expect(moduleRef.profileService.createProfile).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'create_profile' }),
      );
      expect(analyticsService.trackEvent).toHaveBeenCalledTimes(3);
    });
  });

  // ─── Refresh ────────────────────────────────────────────────────────────────

  describe('refresh()', () => {
    it('should rotate token and run standardized refresh pipeline', async () => {
      const session = {
        refreshToken: 'old-refresh-token',
        save: jest.fn().mockResolvedValue(undefined),
      };

      userSessionModel.findOne.mockResolvedValue(session);
      userRepo.findByIdWithRoles.mockResolvedValue({
        _id: { toString: () => 'user-id-1' },
        email: 'refresh@test.com',
        roles: [],
        authAccounts: [{ provider: 'email', isPrimary: true }],
      });
      authTokenService.generatePayload.mockReturnValue({
        sub: 'user-id-1',
        email: 'refresh@test.com',
      });
      authTokenService.generateTokens.mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      userRepo.update.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.refresh(
        buildReq({ headers: { 'x-platform': 'mobile' } }) as any,
        buildRes() as any,
        'old-refresh-token',
      );

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(session.save).toHaveBeenCalled();
      expect(userRepo.update).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'refresh_token' }),
      );
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });

    it('should return accessToken only and set cookie for web refresh', async () => {
      const session = {
        refreshToken: 'old-refresh-token',
        save: jest.fn().mockResolvedValue(undefined),
      };

      userSessionModel.findOne.mockResolvedValue(session);
      userRepo.findByIdWithRoles.mockResolvedValue({
        _id: { toString: () => 'user-id-web-1' },
        email: 'refresh-web@test.com',
        roles: [],
        authAccounts: [{ provider: 'email', isPrimary: true }],
      });
      authTokenService.generatePayload.mockReturnValue({
        sub: 'user-id-web-1',
        email: 'refresh-web@test.com',
      });
      authTokenService.generateTokens.mockReturnValue({
        accessToken: 'web-access-token',
        refreshToken: 'web-refresh-token',
      });
      userRepo.update.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const req = buildReq({ headers: { 'x-platform': 'web' } }) as any;
      const res = buildRes() as any;
      const result = await service.refresh(req, res, 'old-refresh-token');

      expect(result).toEqual({ accessToken: 'web-access-token' });
      expect(res.cookie).toHaveBeenCalled();
      expect(userRepo.update).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'refresh_token' }),
      );
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });
  });

  // ─── Send OTP ────────────────────────────────────────────────────────────────

  describe('sendOtp()', () => {
    it('should call otpService.generate and return result', async () => {
      otpService.generate.mockReturnValue('123456');
      const result = await service.sendOtp('+91', '1234567890');
      expect(otpService.generate).toHaveBeenCalledWith('+91', '1234567890');
      expect(result).toEqual({ phone: '1234567890', otp: '123456' });
    });
  });

  // ─── Verify OTP ──────────────────────────────────────────────────────────────

  describe('verifyOtp()', () => {
    it('should throw UnauthorizedException when OTP is invalid', async () => {
      otpService.verify.mockReturnValue(false);

      await expect(
        service.verifyOtp(
          buildReq() as any,
          buildRes() as any,
          '+91',
          '9999999999',
          '000000',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens when OTP is valid and user exists', async () => {
      otpService.verify.mockReturnValue(true);
      const existingUser = {
        _id: { toString: () => 'user-id-1' },
        phone: { countryCode: '+91', phone: '1234567890' },
        isPhoneVerified: true,
        isOnboardingCompleted: false,
        save: jest.fn().mockResolvedValue(undefined),
      };
      userRepo.findByProvider.mockResolvedValue(existingUser);
      userRepo.findByIdWithRoles.mockResolvedValue({
        _id: { toString: () => 'user-id-1' },
        roles: [],
      });
      authTokenService.generatePayload.mockReturnValue({
        sub: 'user-id-1',
        email: 'otp@test.com',
      });
      authTokenService.generateTokens.mockReturnValue({
        accessToken: 'acc-tok',
        refreshToken: 'ref-tok',
      });
      userRepo.update.mockResolvedValue({});
      userSessionModel.create.mockResolvedValue({});
      cacheService.set.mockResolvedValue(undefined);

      const result = await service.verifyOtp(
        buildReq({ headers: { 'x-platform': 'mobile' } }) as any,
        buildRes() as any,
        '+91',
        '1234567890',
        '123456',
      );

      expect(result).toHaveProperty('accessToken');
      expect(userRepo.update).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalled();
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });

    it('should create a new phone user and run register pipeline when OTP is valid and user does not exist', async () => {
      otpService.verify.mockReturnValue(true);
      userRepo.findByProvider.mockResolvedValue(null);
      planModel.exec.mockResolvedValue({
        _id: 'plan-id-1',
        durationDays: 30,
      });

      const savedUser = {
        _id: { toString: () => 'user-id-otp-1' },
        phone: { countryCode: '+91', phone: '1234567890' },
        isPhoneVerified: true,
        isOnboardingCompleted: false,
      };

      userRepo.create.mockResolvedValue(savedUser);
      userRepo.findByIdWithRoles.mockResolvedValue({
        _id: { toString: () => 'user-id-otp-1' },
        roles: [],
      });
      authTokenService.generatePayload.mockReturnValue({
        sub: 'user-id-otp-1',
        email: 'otp@test.com',
      });
      authTokenService.generateTokens.mockReturnValue({
        accessToken: 'acc-tok',
        refreshToken: 'ref-tok',
      });
      userRepo.update.mockResolvedValue({});
      userSessionModel.create.mockResolvedValue({});
      cacheService.set.mockResolvedValue(undefined);
      subscriptionModel.findOneAndUpdate.mockResolvedValue({});
      userRepo.updateMembership.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.verifyOtp(
        buildReq({ headers: { 'x-platform': 'android' } }) as any,
        buildRes() as any,
        '+91',
        '1234567890',
        '123456',
      );

      expect(result).toHaveProperty('message', 'Registration successful');
      expect(subscriptionModel.findOneAndUpdate).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalled();
      expect(analyticsService.trackEvent).toHaveBeenCalled();
      expect(otpService.generate).not.toHaveBeenCalled();
    });
  });

  // ─── Social Login / Register ───────────────────────────────────────────────

  describe('socialLogin()', () => {
    it('should run standardized login pipeline when social user already exists', async () => {
      const existingUser = {
        _id: { toString: () => 'social-existing-1' },
        isOnboardingCompleted: false,
      };

      userRepo.findByProvider.mockResolvedValue(existingUser);
      userRepo.findByIdWithRoles.mockResolvedValue({
        _id: { toString: () => 'social-existing-1' },
        email: 'social-existing@test.com',
        roles: [],
      });
      authTokenService.generatePayload.mockReturnValue({
        sub: 'social-existing-1',
        email: 'social-existing@test.com',
      });
      authTokenService.generateTokens.mockReturnValue({
        accessToken: 'acc-tok',
        refreshToken: 'ref-tok',
      });
      userRepo.update.mockResolvedValue({});
      userSessionModel.create.mockResolvedValue({});
      cacheService.set.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.socialLogin(
        buildReq({ headers: { 'x-platform': 'ios' } }) as any,
        buildRes() as any,
        {
          provider: 'google',
          provider_id: 'google-existing-1',
          access_token: 'google-token',
        } as any,
      );

      expect(result).toHaveProperty('accessToken');
      expect(userRepo.update).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalled();
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });

    it('should create a new social user and run register pipeline when provider user does not exist', async () => {
      userRepo.findByProvider.mockResolvedValue(null);
      planModel.exec.mockResolvedValue({
        _id: 'plan-id-1',
        durationDays: 30,
      });

      const savedUser = {
        _id: { toString: () => 'social-user-1' },
        email: 'social@test.com',
        isOnboardingCompleted: false,
      };

      userRepo.create.mockResolvedValue(savedUser);
      userRepo.findByIdWithRoles.mockResolvedValue({
        _id: { toString: () => 'social-user-1' },
        email: 'social@test.com',
        roles: [],
      });
      authTokenService.generatePayload.mockReturnValue({
        sub: 'social-user-1',
        email: 'social@test.com',
      });
      authTokenService.generateTokens.mockReturnValue({
        accessToken: 'acc-tok',
        refreshToken: 'ref-tok',
      });
      userSessionModel.create.mockResolvedValue({});
      cacheService.set.mockResolvedValue(undefined);
      subscriptionModel.findOneAndUpdate.mockResolvedValue({});
      userRepo.updateMembership.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.socialLogin(
        buildReq({ headers: { 'x-platform': 'ios' } }) as any,
        buildRes() as any,
        {
          provider: 'google',
          provider_id: 'google-provider-1',
          access_token: 'google-token',
          email: 'social@test.com',
        } as any,
      );

      expect(result).toHaveProperty('message', 'Registration successful');
      expect(subscriptionModel.findOneAndUpdate).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalled();
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });
  });

  // ─── Logout ──────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should delete the specific user session', async () => {
      userSessionModel.updateOne.mockResolvedValue({});
      userRepo.update.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      await service.logout(buildReq() as any, 'user-id-1', 'refresh-tok');

      expect(userSessionModel.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id-1',
          refreshToken: 'refresh-tok',
        }),
        expect.objectContaining({ isActive: false }),
      );
      expect(userRepo.update).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'logout' }),
      );
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });
  });

  describe('logoutAll()', () => {
    it('should delete all user sessions', async () => {
      userSessionModel.updateMany.mockResolvedValue({ modifiedCount: 3 });
      userRepo.update.mockResolvedValue({});
      activityLogModel.create.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      await service.logoutAll(buildReq() as any, 'user-id-1');

      expect(userSessionModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-id-1' }),
        expect.objectContaining({ isActive: false }),
      );
      expect(userRepo.update).toHaveBeenCalled();
      expect(activityLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'logout_all_devices' }),
      );
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });
  });
});
