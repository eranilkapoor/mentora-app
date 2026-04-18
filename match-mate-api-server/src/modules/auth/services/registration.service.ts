import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repositories/user.repository';
import { ProfileService } from '../../profile/profile.service';
import { OtpService } from '../otp.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, SocialLoginDto } from '../dto/auth.dto';
import { AuthProvider } from '../enums/auth-provider.enum';
import type { ICacheService } from 'src/modules/cache/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/cache.interface';
import { AuthTokenService } from '../auth-token.service';
import {
  UserSession,
  UserSessionDocument,
} from '../schemas/user-session.schema';
import { AppRequest } from 'src/common/interfaces/app-request.interface';

interface TokenAttachUser {
  _id: { toString(): string };
}

@Injectable()
export class RegistrationService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly authTokenService: AuthTokenService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,

    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSessionDocument>,
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
      throw new UnauthorizedException('User not found');
    }

    const payload = this.authTokenService.generatePayload(populatedUser);

    const { accessToken, refreshToken } =
      this.authTokenService.generateTokens(payload);

    const platform = String(req.headers['x-platform'] || 'web');

    const cacheKey = `auth:${user._id.toString()}`;
    await this.cache.set(cacheKey, accessToken, 900);

    await this.userSessionModel.create({
      userId: user._id,
      refreshToken,
      device: this.getHeaderString(req, 'x-device-id') ?? '',
      ip: req.ip,
      userAgent: this.getHeaderString(req, 'user-agent') ?? '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 🌐 WEB → cookie
    if (platform === 'web') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken };
    }

    // 📱 MOBILE → return both
    return { accessToken, refreshToken };
  }

  async refresh(req: AppRequest, res: Response, oldRefreshToken?: string) {
    try {
      // ✅ 1. Extract userId from JWT (set by JwtRefreshStrategy or guard)
      const userId = req.user?.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // ✅ 2. Get refresh token (WEB → cookie, MOBILE → param)
      const token =
        oldRefreshToken ?? this.getCookieString(req, 'refreshToken');

      if (!token) {
        throw new UnauthorizedException('Refresh token missing');
      }

      // ✅ 3. Validate session
      const session = await this.userSessionModel.findOne({
        userId,
        refreshToken: token,
        isActive: true,
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // ✅ 4. Rebuild payload (RBAC fresh)
      const user = await this.userRepo.findByIdWithRoles(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const payload = this.authTokenService.generatePayload(user);

      // ✅ 5. Generate new tokens
      const { accessToken, refreshToken } =
        this.authTokenService.generateTokens(payload);

      // 🔥 6. ROTATE refresh token
      session.refreshToken = refreshToken;
      await session.save();

      const platform = String(req.headers['x-platform'] || 'web');

      // 🌐 WEB → set cookie
      if (platform === 'web') {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/auth/refresh',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { accessToken };
      }

      // 📱 MOBILE → return both
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async register(req: AppRequest, res: Response, dto: RegisterDto) {
    try {
      const email = dto.email.toLowerCase();

      const existingUser = await this.userRepo.findByProvider(
        AuthProvider.EMAIL,
        email,
      );

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const user = await this.userRepo.create({
        authAccounts: [
          {
            provider: AuthProvider.EMAIL,
            providerId: email,
            passwordHash,
            isVerified: false,
            isPrimary: true,
          },
        ],
        email: email,
        lastLoginIp: req.ip || '127.0.0.1',
        lastLoginDevice: this.getHeaderString(req, 'x-device-id'),
      });

      await user.save();

      const tokens = await this.attachToken(req, res, user);

      //await this.subscriptionService.createFreePlan(user._id);

      // await this.activityService.log({
      //     userId: user._id,
      //     action: 'register',
      //     metadata: { method: context.method },
      // });

      //await this.eventService.emit('user_registered', user);

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
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }

  async login(req: AppRequest, res: Response, dto: LoginDto) {
    try {
      const email = dto.email.toLowerCase();

      const existingUser = await this.userRepo.findByProvider(
        AuthProvider.EMAIL,
        email,
      );

      if (!existingUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (
        !existingUser.authAccounts[0].passwordHash ||
        !(await bcrypt.compare(
          dto.password,
          existingUser.authAccounts[0].passwordHash,
        ))
      ) {
        throw new UnauthorizedException('Invalid credentials');
      }

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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
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

  sendOtp(country_code: string, phone: string) {
    const otp = this.otpService.generate(country_code, phone);
    return { phone, otp };
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
      if (!isValid) throw new UnauthorizedException('Invalid OTP');

      const existingUser = await this.userRepo.findByProvider(
        AuthProvider.PHONE,
        `${country_code}|${phone}`,
      );

      if (existingUser) {
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
        authAccounts: [
          {
            provider: AuthProvider.PHONE,
            providerId: `${country_code}|${phone}`,
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      user.phone = { countryCode: country_code, phone };
      await user.save();

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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('OTP verification failed');
    }
  }

  async socialLogin(req: AppRequest, res: Response, dto: SocialLoginDto) {
    try {
      const existingUser = await this.userRepo.findByProvider(
        AuthProvider[dto.provider.toUpperCase() as keyof typeof AuthProvider],
        dto.provider_id,
      );

      if (existingUser) {
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

      const tokens = await this.attachToken(req, res, user);

      return {
        user: {
          userId: user._id,
          provider: dto.provider,
          isOnboardingCompleted: user.isOnboardingCompleted,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Social login failed');
    }
  }
}
