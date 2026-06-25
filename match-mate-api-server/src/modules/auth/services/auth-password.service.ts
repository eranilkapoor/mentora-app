import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { AppRequest } from '@/common/interfaces/app-request.interface';
import {
  ActivityLog,
  ActivityLogDocument,
} from '@/modules/profiles/schemas/settings/activity-logs.schema';
import {
  ActivityAction,
  ActivityCategory,
  ActivityPlatform,
} from '@/modules/profiles/enums/activity-log.enums';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../schemas/user.schema';
import {
  UserSession,
  UserSessionDocument,
} from '../schemas/user-session.schema';
import { AuthProvider } from '../enums/auth-provider.enum';
import { ChangePasswordDto, ResetPasswordDto } from '../dto/auth.dto';

type EmailAuthAccount = {
  provider: AuthProvider;
  passwordHash?: string;
};

type ResetTokenPayload = {
  userId: string;
  type: 'password-reset';
};

@Injectable()
export class AuthPasswordService {
  private readonly activityPlatformMap: Record<string, ActivityPlatform> = {
    ios: ActivityPlatform.IOS,
    android: ActivityPlatform.ANDROID,
  };

  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSessionDocument>,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async forgotPassword(req: AppRequest, email: string) {
    try {
      const user = await this.userRepo.findByProvider(
        AuthProvider.EMAIL,
        email.toLowerCase(),
      );
      const emailAccount = this.findEmailAuthAccount(user);

      if (!user || !emailAccount?.passwordHash) {
        throw new AppException(
          ErrorCode.AUTH_USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
          null,
          undefined,
          { reason: 'email_password_account_not_found' },
        );
      }

      const resetToken = this.jwtService.sign(
        { userId: user._id, type: 'password-reset' },
        { expiresIn: '15m' },
      );
      const resetCode = this.generateResetPasswordCode();
      await this.cache.set(
        this.getResetPasswordCodeCacheKey(resetCode),
        {
          token: resetToken,
        },
        900,
      );
      const resetUrl = this.buildResetPasswordLink(resetCode);

      await this.notificationsService.notify({
        userId: String(user._id),
        title: 'Reset your password',
        message: `Use this secure link to reset your password: ${resetUrl}`,
        type: 'system',
        category: 'system',
        channels: ['email'],
        metadata: {
          source: 'forgot-password',
        },
      });

      await this.writePasswordActivity(
        req,
        user,
        ActivityAction.PASSWORD_RESET_REQUEST,
        'forgot-password',
      );

      return { sent: true };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        ErrorCode.EMAIL_SERVICE_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
        null,
        undefined,
        { reason: 'password_reset_request_failed' },
      );
    }
  }

  async resetPassword(req: AppRequest, dto: ResetPasswordDto) {
    try {
      if (dto.newPassword !== dto.confirmPassword) {
        throw new AppException(
          ErrorCode.AUTH_PASSWORD_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }

      const payload = this.jwtService.verify<ResetTokenPayload>(dto.token);

      if (!payload?.userId || payload.type !== 'password-reset') {
        throw new AppException(
          ErrorCode.AUTH_INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userRepo.findById(payload.userId);
      const emailAccount = this.findEmailAuthAccount(user);

      if (!user || !emailAccount?.passwordHash) {
        throw new AppException(
          ErrorCode.AUTH_USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
        );
      }

      emailAccount.passwordHash = await bcrypt.hash(dto.newPassword, 10);
      user.lastPasswordChangedAt = new Date();

      await user.save();
      await this.revokeUserSessions(user);

      await this.notificationsService.notify({
        userId: String(user._id),
        title: 'Password changed successfully',
        message:
          'Your password has been reset successfully. If this was not you, contact support immediately.',
        type: 'system',
        category: 'system',
        channels: ['in_app', 'email'],
        metadata: {
          source: 'reset-password',
        },
      });

      await this.writePasswordActivity(
        req,
        user,
        ActivityAction.PASSWORD_RESET_SUCCESS,
        'reset-password',
      );

      return { changed: true };
    } catch (error: unknown) {
      if (
        error instanceof AppException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new AppException(
        ErrorCode.AUTH_INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED,
        null,
        undefined,
        { reason: 'password_reset_failed' },
      );
    }
  }

  async exchangeResetPasswordCode(req: AppRequest, code: string) {
    try {
      const cacheKey = this.getResetPasswordCodeCacheKey(code.trim());
      const cachedValue = await this.cache.get<{ token?: string }>(cacheKey);
      const token = cachedValue?.token;

      if (!token) {
        throw new AppException(
          ErrorCode.AUTH_INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.cache.del(cacheKey);
      return { token };
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        ErrorCode.AUTH_INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED,
        null,
        undefined,
        {
          reason: 'password_reset_code_exchange_failed',
          ...(req.correlationId ? { correlationId: req.correlationId } : {}),
        },
      );
    }
  }

  async changePassword(
    req: AppRequest,
    userId: string,
    dto: ChangePasswordDto,
  ) {
    try {
      if (dto.newPassword !== dto.confirmPassword) {
        throw new AppException(
          ErrorCode.AUTH_PASSWORD_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepo.findById(userId);
      const emailAccount = this.findEmailAuthAccount(user);

      if (!user || !emailAccount?.passwordHash) {
        throw new AppException(
          ErrorCode.AUTH_USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isOldPasswordValid = await bcrypt.compare(
        dto.oldPassword,
        emailAccount.passwordHash,
      );

      if (!isOldPasswordValid) {
        throw new AppException(
          ErrorCode.AUTH_OLD_PASSWORD_INCORRECT,
          HttpStatus.UNAUTHORIZED,
        );
      }

      emailAccount.passwordHash = await bcrypt.hash(dto.newPassword, 10);
      user.lastPasswordChangedAt = new Date();
      await user.save();

      await this.notificationsService.notify({
        userId: String(user._id),
        title: 'Password changed',
        message:
          'Your password was changed successfully. If this was not you, contact support immediately.',
        type: 'system',
        category: 'system',
        channels: ['in_app', 'email'],
        metadata: {
          source: 'change-password',
        },
      });

      await this.writePasswordActivity(
        req,
        user,
        ActivityAction.CHANGE_PASSWORD,
        'change-password',
      );

      return { changed: true };
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        ErrorCode.AUTH_INVALID_PASSWORD,
        HttpStatus.UNAUTHORIZED,
        null,
        undefined,
        { reason: 'password_change_failed' },
      );
    }
  }

  private findEmailAuthAccount(
    user: UserDocument | null,
  ): EmailAuthAccount | undefined {
    if (!user?.authAccounts || !Array.isArray(user.authAccounts)) {
      return undefined;
    }

    return user.authAccounts.find(
      (account) => account.provider === AuthProvider.EMAIL,
    );
  }

  private buildResetPasswordLink(code: string): string {
    const baseUrl = this.configService.getOrThrow<string>('app.webUrl');
    return `${baseUrl}/reset-password?code=${encodeURIComponent(code)}`;
  }

  private generateResetPasswordCode(): string {
    return randomUUID().replace(/-/g, '');
  }

  private getResetPasswordCodeCacheKey(code: string): string {
    return `auth:password-reset:${code}`;
  }

  private async revokeUserSessions(user: UserDocument): Promise<void> {
    await this.userSessionModel.updateMany(
      { userId: user._id },
      { isActive: false, loggedOutAt: new Date() },
    );
  }

  private async writePasswordActivity(
    req: AppRequest,
    user: UserDocument,
    action: ActivityAction,
    source: string,
  ): Promise<void> {
    await this.activityLogModel.create({
      userId: user._id,
      category: ActivityCategory.AUTH,
      action,
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device: this.getHeaderString(req, 'x-device-id'),
      userAgent: this.getHeaderString(req, 'user-agent'),
      requestId: req.requestId,
      correlationId: req.correlationId,
      platform: this.resolveActivityPlatform(req),
      metadata: { source },
    });
  }

  private resolveActivityPlatform(req: AppRequest): ActivityPlatform {
    const rawPlatform = this.getHeaderString(req, 'x-platform') || 'web';
    return (
      this.activityPlatformMap[rawPlatform.toLowerCase()] ??
      ActivityPlatform.WEB
    );
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
}
