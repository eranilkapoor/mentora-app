import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CookieOptions, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  BillingCycle,
  PlanTier,
  Role,
  Status,
  SubscriptionStatus,
} from 'src/common/enums';
import { UserRepository } from '../repositories/user.repository';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import {
  RegisterDto,
  LoginDto,
  SocialLoginDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth.dto';
import { AuthProvider } from '../enums/auth-provider.enum';
import type { ICacheService } from 'src/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/interfaces/cache.interface';
import { AuthTokenService } from './auth-token.service';
import {
  UserSession,
  UserSessionDocument,
} from '../schemas/user-session.schema';
import { Plan } from '../../subscription/schemas/plan.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../../subscription/schemas/subscription.schema';
import { AppRequest } from 'src/common/interfaces/app-request.interface';
import {
  ActivityAction,
  ActivityCategory,
  ActivityLog,
  ActivityLogDocument,
  ActivityPlatform,
} from '../../profile/schemas/settings/activity-logs.schema';
import { NotificationService } from '../../notification/services/notification.service';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import {
  AnalyticsEventType,
  AnalyticsPlatform,
} from '../../analytics/enums/analytics-event.enum';
import {
  Verification,
  VerificationDocument,
} from '../../safety/schemas/verification.schema';
import { AuthPasswordService } from './auth-password.service';
import { ErrorCode } from 'src/common/constants';
import {
  throwConflict,
  throwUnauthorized,
} from 'src/common/exceptions/throw-app-exception';
import { AppException } from 'src/common/exceptions/app.exception';

interface TokenAttachUser {
  _id: { toString(): string };
}

interface RefreshTokenPayload {
  sub: string;
}

interface RegisterRequestContext {
  platform: ActivityPlatform;
  ip?: string;
  device?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly authTokenService: AuthTokenService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,

    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSessionDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Plan.name)
    private readonly planModel: Model<Plan>,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly notificationService: NotificationService,
    private readonly analyticsService: AnalyticsService,
    private readonly authPasswordService: AuthPasswordService,
    private readonly configService: ConfigService,
  ) {}

  private async attachToken(
    req: AppRequest,
    res: Response,
    user: TokenAttachUser,
  ) {
    const populatedUser = await this.userRepo.findByIdWithRoles(
      user._id.toString(),
    );

    if (!populatedUser) {
      return throwUnauthorized(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    const payload = this.authTokenService.generatePayload(populatedUser);

    const { accessToken, refreshToken } =
      this.authTokenService.generateTokens(payload);

    const platform = String(req.headers['x-platform'] || 'web');
    const deviceId = this.getHeaderString(req, 'x-device-id') ?? '';

    const cacheKey = `auth:${user._id.toString()}`;
    await this.cache.set(cacheKey, accessToken, 900);

    await this.userSessionModel.updateMany(
      {
        userId: user._id,
        device: deviceId,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          loggedOutAt: new Date(),
        },
      },
    );

    const session = await this.userSessionModel.create({
      userId: user._id,
      refreshToken,
      device: deviceId,
      ip: req.ip,
      userAgent: this.getHeaderString(req, 'user-agent') ?? '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    //  WEB  cookie
    if (platform === 'web') {
      res.cookie('refreshToken', refreshToken, {
        ...this.getRefreshCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken, refreshToken, sessionId: session._id.toString() };
    }

    //  MOBILE  return both
    return { accessToken, refreshToken, sessionId: session._id.toString() };
  }

  async refresh(req: AppRequest, res: Response, oldRefreshToken?: string) {
    try {
      const token =
        oldRefreshToken ?? this.getCookieString(req, 'refreshToken');

      if (!token) {
        return throwUnauthorized(ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
      }

      const refreshPayload = this.jwtService.verify<RefreshTokenPayload>(token);
      const userId = refreshPayload.sub;

      if (!Types.ObjectId.isValid(userId)) {
        return throwUnauthorized(ErrorCode.AUTH_INVALID_REFRESH_TOKEN, {
          reason: 'invalid_refresh_user_id',
        });
      }

      //  3. Validate session
      const session = await this.userSessionModel.findOne({
        userId: new Types.ObjectId(userId),
        refreshToken: token,
        isActive: true,
      });

      if (!session) {
        return throwUnauthorized(ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
      }

      //  4. Rebuild payload (RBAC fresh)
      const user = await this.userRepo.findByIdWithRoles(userId);

      if (!user) {
        return throwUnauthorized(ErrorCode.AUTH_USER_NOT_FOUND);
      }

      this.assertUserCanAuthenticate(user);

      const tokenPayload = this.authTokenService.generatePayload(user);

      //  5. Generate new tokens
      const { accessToken, refreshToken } =
        this.authTokenService.generateTokens(tokenPayload);

      //  6. ROTATE refresh token
      session.refreshToken = refreshToken;
      await session.save();

      await this.completeRefreshFlow(req, userId, {
        provider: this.resolveProvider(user),
        source: 'refresh-token',
      });

      const platform = String(req.headers['x-platform'] || 'web');

      //  WEB  set cookie
      if (platform === 'web') {
        res.cookie('refreshToken', refreshToken, {
          ...this.getRefreshCookieOptions(),
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { accessToken, refreshToken, sessionId: session._id.toString() };
      }

      //  MOBILE  return both
      return { accessToken, refreshToken, sessionId: session._id.toString() };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      return throwUnauthorized(ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
    }
  }

  async register(req: AppRequest, res: Response, dto: RegisterDto) {
    try {
      const email = dto.email.toLowerCase();
      const requestContext = this.getRegisterRequestContext(req);

      const existingUser = await this.userRepo.findByProvider(
        AuthProvider.EMAIL,
        email,
      );

      if (existingUser) {
        return throwConflict(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const user = await this.userRepo.create({
        email,
        status: Status.ACTIVE,
        roles: [Role.USER],
        isEmailVerified: false,
        isPhoneVerified: false,
        isOnboardingCompleted: false,
        membership: {
          tier: PlanTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          autoRenew: true,
        },
        lastLoginIp: requestContext.ip,
        lastLoginDevice: requestContext.device,
        lastLoginAt: new Date(),
        authAccounts: [
          {
            provider: AuthProvider.EMAIL,
            providerId: email,
            passwordHash,
            isVerified: false,
            isPrimary: true,
          },
        ],
      });

      await this.completeRegisterFlow(req, user._id.toString(), {
        provider: AuthProvider.EMAIL,
        source: 'register-email-password',
        hasEmail: true,
        phone:
          dto.country_code && dto.phone
            ? { countryCode: dto.country_code, phone: dto.phone }
            : undefined,
        sendOtp: Boolean(dto.country_code && dto.phone),
        context: requestContext,
      });
      await this.syncVerificationStatus(user._id.toString(), {
        isEmailVerified: false,
        isPhoneVerified: false,
      });

      const tokens = await this.attachToken(req, res, user);

      return {
        user: {
          userId: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isOnboardingCompleted: user.isOnboardingCompleted,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: 'registration_failed',
      });
    }
  }

  private async createOrUpdateFreeSubscription(userId: string): Promise<void> {
    const freePlan = await this.planModel.findOneAndUpdate(
      { tier: PlanTier.FREE, isActive: true },
      {
        $setOnInsert: {
          name: 'FREE',
          slug: 'free',
          tier: PlanTier.FREE,
          billingCycle: BillingCycle.MONTHLY,
          price: 0,
          durationDays: 3650,
          currency: 'INR',
          isPopular: false,
          sortOrder: 0,
          description: 'Basic free membership with limited matchmaking access.',
          isActive: true,
          version: 1,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + freePlan.durationDays);

    await this.subscriptionModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        userId: new Types.ObjectId(userId),
        planId: freePlan._id,
        startDate,
        endDate,
        autoRenew: true,
        status: SubscriptionStatus.ACTIVE,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await this.userRepo.updateMembership(userId, {
      tier: PlanTier.FREE,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      expiresAt: endDate,
      autoRenew: true,
      planId: String(freePlan._id),
    });
  }

  private async logRegisterActivity(
    userId: string,
    req: AppRequest,
    platform: ActivityPlatform,
    source: string,
    provider: AuthProvider,
  ): Promise<void> {
    await this.activityLogModel.create({
      userId,
      category: ActivityCategory.AUTH,
      action: ActivityAction.REGISTER,
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device: this.getHeaderString(req, 'x-device-id'),
      userAgent: this.getHeaderString(req, 'user-agent'),
      requestId: req.requestId,
      correlationId: req.correlationId,
      platform,
      metadata: {
        source,
        provider,
      },
    });
  }

  private async completeRegisterFlow(
    req: AppRequest,
    userId: string,
    options: {
      provider: AuthProvider;
      source: string;
      hasEmail: boolean;
      context: RegisterRequestContext;
      phone?: { countryCode: string; phone: string };
      sendOtp?: boolean;
    },
  ) {
    await this.createOrUpdateFreeSubscription(userId);
    await this.logRegisterActivity(
      userId,
      req,
      options.context.platform,
      options.source,
      options.provider,
    );
    this.triggerPostRegisterJobs(userId, req, {
      provider: options.provider,
      source: options.source,
      hasEmail: options.hasEmail,
      platform: options.context.platform,
      phone: options.phone,
      sendOtp: options.sendOtp,
    });
  }

  private async completeLoginFlow(
    req: AppRequest,
    userId: string,
    options: {
      provider: AuthProvider;
      source: string;
    },
  ) {
    const context = this.getRegisterRequestContext(req);
    await this.updateLastLoginMetadata(userId, context);
    await this.logLoginActivity(
      userId,
      req,
      context.platform,
      options.source,
      options.provider,
    );
    this.triggerPostLoginJobs(userId, req, {
      provider: options.provider,
      source: options.source,
      platform: context.platform,
    });
  }

  private async completeRefreshFlow(
    req: AppRequest,
    userId: string,
    options: {
      provider: AuthProvider;
      source: string;
    },
  ) {
    const context = this.getRegisterRequestContext(req);
    await this.updateLastLoginMetadata(userId, context);
    await this.logRefreshActivity(
      userId,
      req,
      context.platform,
      options.source,
      options.provider,
    );
    this.triggerPostRefreshJobs(userId, req, {
      provider: options.provider,
      source: options.source,
      platform: context.platform,
    });
  }

  private async completeLogoutFlow(
    req: AppRequest,
    userId: string,
    options: {
      source: string;
      action: ActivityAction;
    },
  ) {
    const context = this.getRegisterRequestContext(req);
    await this.updateLastLoginMetadata(userId, context);
    await this.logLogoutActivity(
      userId,
      req,
      context.platform,
      options.source,
      options.action,
    );
    this.triggerPostLogoutJobs(userId, req, {
      source: options.source,
      platform: context.platform,
    });
  }

  private async updateLastLoginMetadata(
    userId: string,
    context: RegisterRequestContext,
  ): Promise<void> {
    await this.userRepo.update(userId, {
      status: Status.ACTIVE,
      lastLoginIp: context.ip,
      lastLoginDevice: context.device,
      lastLoginAt: new Date(),
    });
  }

  private async syncVerificationStatus(
    userId: string,
    status: {
      isEmailVerified?: boolean;
      isPhoneVerified?: boolean;
      isProfileVerified?: boolean;
    },
  ): Promise<void> {
    const set: Record<string, boolean | Date | undefined> = {};

    if (typeof status.isEmailVerified === 'boolean') {
      set.isEmailVerified = status.isEmailVerified;
    }

    if (typeof status.isPhoneVerified === 'boolean') {
      set.isPhoneVerified = status.isPhoneVerified;
    }

    if (typeof status.isProfileVerified === 'boolean') {
      set.isProfileVerified = status.isProfileVerified;
      set.isVerified = status.isProfileVerified;
      set.verifiedAt = status.isProfileVerified ? new Date() : undefined;
    }

    await this.verificationModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $set: set,
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  private async logLoginActivity(
    userId: string,
    req: AppRequest,
    platform: ActivityPlatform,
    source: string,
    provider: AuthProvider,
  ): Promise<void> {
    await this.activityLogModel.create({
      userId,
      category: ActivityCategory.AUTH,
      action: ActivityAction.LOGIN,
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device: this.getHeaderString(req, 'x-device-id'),
      userAgent: this.getHeaderString(req, 'user-agent'),
      requestId: req.requestId,
      correlationId: req.correlationId,
      platform,
      metadata: {
        source,
        provider,
      },
    });
  }

  private triggerPostLoginJobs(
    userId: string,
    req: AppRequest,
    options: {
      provider: AuthProvider;
      source: string;
      platform: ActivityPlatform;
    },
  ): void {
    const jobs: Array<Promise<unknown>> = [];

    jobs.push(
      Promise.resolve(
        this.analyticsService.trackEvent({
          userId,
          eventType: AnalyticsEventType.USER_LOGGED_IN,
          ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
          userAgent: this.getHeaderString(req, 'user-agent'),
          platform: this.toAnalyticsPlatform(options.platform),
          metadata: {
            provider: options.provider,
            source: options.source,
            requestId: req.requestId,
            correlationId: req.correlationId,
          },
        }),
      ),
    );

    void Promise.allSettled(jobs);
  }

  private async logRefreshActivity(
    userId: string,
    req: AppRequest,
    platform: ActivityPlatform,
    source: string,
    provider: AuthProvider,
  ): Promise<void> {
    await this.activityLogModel.create({
      userId,
      category: ActivityCategory.AUTH,
      action: ActivityAction.REFRESH_TOKEN,
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device: this.getHeaderString(req, 'x-device-id'),
      userAgent: this.getHeaderString(req, 'user-agent'),
      requestId: req.requestId,
      correlationId: req.correlationId,
      platform,
      metadata: {
        source,
        provider,
      },
    });
  }

  private triggerPostRefreshJobs(
    userId: string,
    req: AppRequest,
    options: {
      provider: AuthProvider;
      source: string;
      platform: ActivityPlatform;
    },
  ): void {
    const jobs: Array<Promise<unknown>> = [];

    jobs.push(
      Promise.resolve(
        this.analyticsService.trackEvent({
          userId,
          eventType: AnalyticsEventType.USER_LOGGED_IN,
          ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
          userAgent: this.getHeaderString(req, 'user-agent'),
          platform: this.toAnalyticsPlatform(options.platform),
          metadata: {
            provider: options.provider,
            source: options.source,
            requestId: req.requestId,
            correlationId: req.correlationId,
          },
        }),
      ),
    );

    void Promise.allSettled(jobs);
  }

  private async logLogoutActivity(
    userId: string,
    req: AppRequest,
    platform: ActivityPlatform,
    source: string,
    action: ActivityAction,
  ): Promise<void> {
    await this.activityLogModel.create({
      userId,
      category: ActivityCategory.AUTH,
      action,
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device: this.getHeaderString(req, 'x-device-id'),
      userAgent: this.getHeaderString(req, 'user-agent'),
      requestId: req.requestId,
      correlationId: req.correlationId,
      platform,
      metadata: {
        source,
      },
    });
  }

  private triggerPostLogoutJobs(
    userId: string,
    req: AppRequest,
    options: {
      source: string;
      platform: ActivityPlatform;
    },
  ): void {
    const jobs: Array<Promise<unknown>> = [];

    jobs.push(
      Promise.resolve(
        this.analyticsService.trackEvent({
          userId,
          eventType: AnalyticsEventType.USER_LOGGED_OUT,
          ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
          userAgent: this.getHeaderString(req, 'user-agent'),
          platform: this.toAnalyticsPlatform(options.platform),
          metadata: {
            source: options.source,
            requestId: req.requestId,
            correlationId: req.correlationId,
          },
        }),
      ),
    );

    void Promise.allSettled(jobs);
  }

  private resolveProvider(user: unknown): AuthProvider {
    const userObject = user as {
      authAccounts?: Array<{ provider?: AuthProvider; isPrimary?: boolean }>;
    };

    const accounts = Array.isArray(userObject.authAccounts)
      ? userObject.authAccounts
      : [];

    const primary = accounts.find((account) => account?.isPrimary);
    if (primary?.provider) {
      return primary.provider;
    }

    if (accounts[0]?.provider) {
      return accounts[0].provider;
    }

    return AuthProvider.EMAIL;
  }

  private triggerPostRegisterJobs(
    userId: string,
    req: AppRequest,
    options: {
      provider: AuthProvider;
      source: string;
      hasEmail: boolean;
      platform: ActivityPlatform;
      phone?: { countryCode: string; phone: string };
      sendOtp?: boolean;
    },
  ): void {
    const jobs: Array<Promise<unknown>> = [];
    const channels: Array<'in_app' | 'email'> = options.hasEmail
      ? ['in_app', 'email']
      : ['in_app'];

    jobs.push(
      this.notificationService.notify({
        userId,
        title: 'Welcome to MatchMate',
        message:
          'Your account was created successfully. Complete your profile to start receiving better matches.',
        type: 'system',
        category: 'system',
        channels,
        metadata: {
          source: options.source,
        },
      }),
    );

    if (options.sendOtp && options.phone) {
      jobs.push(
        Promise.resolve(
          this.otpService.generate(
            options.phone.countryCode,
            options.phone.phone,
          ),
        ),
      );
    }

    jobs.push(
      this.analyticsService.trackEvent({
        userId,
        eventType: AnalyticsEventType.USER_REGISTERED,
        ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
        userAgent: this.getHeaderString(req, 'user-agent'),
        platform: this.toAnalyticsPlatform(options.platform),
        metadata: {
          provider: options.provider,
          source: options.source,
          requestId: req.requestId,
          correlationId: req.correlationId,
        },
      }),
    );

    void Promise.allSettled(jobs);
  }

  private readonly analyticsPlatformMap: Record<string, AnalyticsPlatform> = {
    ios: AnalyticsPlatform.IOS,
    android: AnalyticsPlatform.ANDROID,
    mobile: AnalyticsPlatform.API,
  };

  private readonly activityPlatformMap: Record<string, ActivityPlatform> = {
    ios: ActivityPlatform.IOS,
    android: ActivityPlatform.ANDROID,
  };

  private toAnalyticsPlatform(platform: string): AnalyticsPlatform {
    return (
      this.analyticsPlatformMap[platform?.toLowerCase()] ??
      AnalyticsPlatform.WEB
    );
  }

  private toActivityPlatform(platform: string): ActivityPlatform {
    return (
      this.activityPlatformMap[platform?.toLowerCase()] ?? ActivityPlatform.WEB
    );
  }

  private getRegisterRequestContext(req: AppRequest): RegisterRequestContext {
    const rawPlatform = this.getHeaderString(req, 'x-platform') || 'web';
    return {
      platform: this.toActivityPlatform(rawPlatform),
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device:
        this.getHeaderString(req, 'x-device-id') ||
        this.getHeaderString(req, 'user-agent'),
    };
  }

  async login(req: AppRequest, res: Response, dto: LoginDto) {
    try {
      const email = dto.email.toLowerCase();

      const existingUser = await this.userRepo.findByProvider(
        AuthProvider.EMAIL,
        email,
      );

      if (!existingUser) {
        return throwUnauthorized(ErrorCode.AUTH_INVALID_CREDENTIALS);
      }

      this.assertUserCanAuthenticate(existingUser);

      if (
        !existingUser.authAccounts[0].passwordHash ||
        !(await bcrypt.compare(
          dto.password,
          existingUser.authAccounts[0].passwordHash,
        ))
      ) {
        return throwUnauthorized(ErrorCode.AUTH_INVALID_CREDENTIALS);
      }

      await this.completeLoginFlow(req, existingUser._id.toString(), {
        provider: AuthProvider.EMAIL,
        source: 'login-email-password',
      });

      const tokens = await this.attachToken(req, res, existingUser);

      return {
        user: {
          userId: existingUser._id,
          email: existingUser.email,
          isEmailVerified: existingUser.isEmailVerified,
          isOnboardingCompleted: existingUser.isOnboardingCompleted,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: 'login_failed',
      });
    }
  }

  sendOtp(country_code: string, phone: string) {
    const otp = this.otpService.generate(country_code, phone);
    if (this.configService.get<string>('env') !== 'production') {
      return { phone, otp };
    }

    return { phone };
  }

  async verifyOtp(
    req: AppRequest,
    res: Response,
    country_code: string,
    phone: string,
    otp: string,
  ) {
    try {
      const isValid = this.otpService.verify(country_code, phone, otp);
      if (!isValid) return throwUnauthorized(ErrorCode.AUTH_INVALID_OTP);

      const existingUser = await this.userRepo.findByProvider(
        AuthProvider.PHONE,
        `${country_code}|${phone}`,
      );

      if (existingUser) {
        this.assertUserCanAuthenticate(existingUser);
        await this.syncVerificationStatus(existingUser._id.toString(), {
          isPhoneVerified: true,
          isEmailVerified: Boolean(existingUser.isEmailVerified),
        });

        await this.completeLoginFlow(req, existingUser._id.toString(), {
          provider: AuthProvider.PHONE,
          source: 'login-phone-otp',
        });

        const tokens = await this.attachToken(req, res, existingUser);

        return {
          user: {
            userId: existingUser._id,
            phone: existingUser.phone,
            isPhoneVerified: existingUser.isPhoneVerified,
            isOnboardingCompleted: existingUser.isOnboardingCompleted,
          },
          ...tokens,
        };
      }

      const user = await this.userRepo.create({
        status: Status.ACTIVE,
        roles: [Role.USER],
        isEmailVerified: false,
        isPhoneVerified: true,
        isOnboardingCompleted: false,
        phone: { countryCode: country_code, phone },
        membership: {
          tier: PlanTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          autoRenew: true,
        },
        lastLoginIp: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
        lastLoginDevice:
          this.getHeaderString(req, 'x-device-id') ||
          this.getHeaderString(req, 'user-agent'),
        lastLoginAt: new Date(),
        authAccounts: [
          {
            provider: AuthProvider.PHONE,
            providerId: `${country_code}|${phone}`,
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      await this.completeRegisterFlow(req, user._id.toString(), {
        provider: AuthProvider.PHONE,
        source: 'register-phone-otp',
        hasEmail: false,
        phone: { countryCode: country_code, phone },
        sendOtp: false,
        context: this.getRegisterRequestContext(req),
      });
      await this.syncVerificationStatus(user._id.toString(), {
        isEmailVerified: false,
        isPhoneVerified: true,
      });

      const tokens = await this.attachToken(req, res, user);

      return {
        user: {
          userId: user._id,
          phone: user.phone,
          isPhoneVerified: user.isPhoneVerified,
          isOnboardingCompleted: user.isOnboardingCompleted,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: 'otp_verification_failed',
      });
    }
  }

  async socialLogin(req: AppRequest, res: Response, dto: SocialLoginDto) {
    try {
      const existingUser = await this.userRepo.findByProvider(
        AuthProvider[dto.provider.toUpperCase() as keyof typeof AuthProvider],
        dto.provider_id,
      );

      if (existingUser) {
        this.assertUserCanAuthenticate(existingUser);

        await this.completeLoginFlow(req, existingUser._id.toString(), {
          provider:
            AuthProvider[
              dto.provider.toUpperCase() as keyof typeof AuthProvider
            ],
          source: `login-social-${dto.provider}`,
        });

        const tokens = await this.attachToken(req, res, existingUser);

        return {
          user: {
            userId: existingUser._id,
            provider: dto.provider,
            isOnboardingCompleted: existingUser.isOnboardingCompleted,
          },
          ...tokens,
        };
      }

      const user = await this.userRepo.create({
        email: dto.email?.toLowerCase(),
        status: Status.ACTIVE,
        roles: [Role.USER],
        isEmailVerified: Boolean(dto.email),
        isPhoneVerified: false,
        isOnboardingCompleted: false,
        membership: {
          tier: PlanTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          autoRenew: true,
        },
        lastLoginIp: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
        lastLoginDevice:
          this.getHeaderString(req, 'x-device-id') ||
          this.getHeaderString(req, 'user-agent'),
        lastLoginAt: new Date(),
        authAccounts: [
          {
            provider:
              AuthProvider[
                dto.provider.toUpperCase() as keyof typeof AuthProvider
              ],
            providerId: dto.provider_id,
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      await this.completeRegisterFlow(req, user._id.toString(), {
        provider:
          AuthProvider[dto.provider.toUpperCase() as keyof typeof AuthProvider],
        source: `register-social-${dto.provider}`,
        hasEmail: Boolean(dto.email),
        sendOtp: false,
        context: this.getRegisterRequestContext(req),
      });
      await this.syncVerificationStatus(user._id.toString(), {
        isEmailVerified: Boolean(dto.email),
        isPhoneVerified: false,
      });

      const tokens = await this.attachToken(req, res, user);

      return {
        user: {
          userId: user._id,
          provider: dto.provider,
          email: user.email,
          isOnboardingCompleted: user.isOnboardingCompleted,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: 'social_login_failed',
      });
    }
  }

  async forgotPassword(req: AppRequest, email: string) {
    return this.authPasswordService.forgotPassword(req, email);
  }

  async resetPassword(req: AppRequest, dto: ResetPasswordDto) {
    return this.authPasswordService.resetPassword(req, dto);
  }

  async changePassword(
    req: AppRequest,
    userId: string,
    dto: ChangePasswordDto,
  ) {
    return this.authPasswordService.changePassword(req, userId, dto);
  }

  async verifyUser(userId: string) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return throwUnauthorized(ErrorCode.AUTH_USER_NOT_FOUND);
      }

      this.assertUserCanAuthenticate(user);

      return {
        userId: user._id,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isOnboardingCompleted: user.isOnboardingCompleted,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: 'user_verification_failed',
      });
    }
  }

  async logout(
    req: AppRequest,
    refreshToken: string,
  ): Promise<{ success: true }> {
    if (!refreshToken) {
      return throwUnauthorized(ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
    }

    const session = await this.userSessionModel.findOne({
      refreshToken,
      isActive: true,
    });

    if (!session) {
      return throwUnauthorized(ErrorCode.AUTH_SESSION_EXPIRED);
    }

    const userId = session.userId?.toString();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return throwUnauthorized(ErrorCode.AUTH_INVALID_TOKEN, {
        reason: 'invalid_session_user',
      });
    }

    await this.userSessionModel.updateOne(
      {
        _id: session._id,
      },
      {
        $set: {
          isActive: false,
          loggedOutAt: new Date(),
        },
      },
    );

    await this.completeLogoutFlow(req, userId, {
      source: 'logout-current-device',
      action: ActivityAction.LOGOUT,
    });

    return {
      success: true,
    };
  }

  async logoutAll(req: AppRequest, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return throwUnauthorized(ErrorCode.AUTH_INVALID_TOKEN, {
        reason: 'invalid_logout_all_user',
      });
    }

    await this.userSessionModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          loggedOutAt: new Date(),
        },
      },
    );

    await this.completeLogoutFlow(req, userId, {
      source: 'logout-all-devices',
      action: ActivityAction.LOGOUT_ALL_DEVICES,
    });

    return { success: true };
  }

  async listSessions(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return throwUnauthorized(ErrorCode.AUTH_INVALID_TOKEN, {
        reason: 'invalid_session_user',
      });
    }

    const sessions = await this.userSessionModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return {
      sessions: sessions.map((session) => {
        const datedSession = session as typeof session & {
          createdAt?: Date;
          updatedAt?: Date;
        };

        return {
          sessionId: session._id.toString(),
          deviceId: session.device,
          deviceName: session.userAgent,
          platform: this.inferPlatform(session.userAgent),
          ipAddress: session.ip,
          lastActive: datedSession.updatedAt ?? datedSession.createdAt,
          expiresAt: session.expiresAt,
        };
      }),
    };
  }

  async logoutSession(
    req: AppRequest,
    userId: string,
    sessionId: string,
  ): Promise<{ success: true }> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(sessionId)) {
      return throwUnauthorized(ErrorCode.AUTH_INVALID_TOKEN, {
        reason: 'invalid_session_id',
      });
    }

    const session = await this.userSessionModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          loggedOutAt: new Date(),
        },
      },
      { new: true },
    );

    if (!session) {
      return throwUnauthorized(ErrorCode.AUTH_SESSION_EXPIRED);
    }

    await this.completeLogoutFlow(req, userId, {
      source: 'logout-selected-device',
      action: ActivityAction.LOGOUT,
    });

    return { success: true };
  }

  private assertUserCanAuthenticate(user: { status?: Status }) {
    if (user.status === Status.BLOCKED || user.status === Status.SUSPENDED) {
      return throwUnauthorized(ErrorCode.AUTH_ACCOUNT_BLOCKED);
    }

    if (user.status === Status.DELETED) {
      return throwUnauthorized(ErrorCode.AUTH_ACCOUNT_DELETED);
    }
  }

  private inferPlatform(userAgent?: string): string {
    const value = userAgent?.toLowerCase() ?? '';
    if (value.includes('android')) return 'android';
    if (value.includes('iphone') || value.includes('ipad')) return 'ios';
    if (value.includes('windows')) return 'windows';
    if (value.includes('mac')) return 'macos';
    return 'unknown';
  }

  getRefreshCookieOptions(): CookieOptions {
    const isProduction = this.configService.get<string>('env') === 'production';
    const domain =
      this.configService.get<string>('app.cookieDomain') || undefined;

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      ...(domain ? { domain } : {}),
    };
  }

  private getHeaderString(req: AppRequest, key: string): string | undefined {
    const value = req.headers[key];
    if (typeof value === 'string') {
      return value;
    }

    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'string'
    ) {
      return value[0];
    }

    return undefined;
  }

  private getCookieString(req: AppRequest, key: string): string | undefined {
    const requestObject = req as unknown as Record<string, unknown>;
    const cookies = requestObject['cookies'];
    if (typeof cookies !== 'object' || cookies === null) {
      return undefined;
    }

    const value = (cookies as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
  }
}
