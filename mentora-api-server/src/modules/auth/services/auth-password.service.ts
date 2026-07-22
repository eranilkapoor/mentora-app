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
import { DUMMY_PASSWORD_HASH } from './auth-security.constants';

type EmailAuthAccount = {
  provider: AuthProvider;
  passwordHash?: string;
};

type ResetTokenPayload = {
  userId: string;
  type: 'password-reset';
  jti: string;
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
        await bcrypt.compare('not-a-real-password', DUMMY_PASSWORD_HASH);
        return { sent: true };
      }

      const jti = randomUUID();
      const resetToken = this.jwtService.sign(
        { userId: user._id, type: 'password-reset' },
        { expiresIn: '15m', jwtid: jti },
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

      await this.notificationsService.sendSecurityEmail({
        userId: String(user._id),
        subject: 'Reset your password',
        message: `Use this secure link to reset your password: ${resetUrl}`,
        html: this.buildPasswordResetEmail(user, resetUrl),
        templateKey: 'auth.password_reset',
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

      if (
        !payload?.userId ||
        payload.type !== 'password-reset' ||
        !payload.jti
      ) {
        throw new AppException(
          ErrorCode.AUTH_INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const consumeKey = `auth:password-reset:consumed:${payload.jti}`;
      const consumeCount = await this.cache.incr(consumeKey);
      await this.cache.expire(consumeKey, 900);
      if (consumeCount !== 1) {
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
        emailBody: this.buildPasswordChangedEmail(user, 'reset'),
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
        emailBody: this.buildPasswordChangedEmail(user, 'change'),
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

  private buildPasswordResetEmail(user: UserDocument, resetUrl: string) {
    const name = this.getUserDisplayName(user);
    return this.buildSecurityEmail({
      greeting: `Hello ${this.escapeHtml(name)},`,
      eyebrow: 'Secure password reset',
      heading: 'Reset your Mentora password',
      intro:
        'We received a request to reset the password for your Mentora account. Use the secure button below to create a new password.',
      ctaLabel: 'Reset password',
      ctaUrl: resetUrl,
      details: [
        'This link expires in 15 minutes.',
        'For your security, this link can be used only once.',
        'If you did not request this reset, you can safely ignore this email.',
      ],
      footerNote:
        'Mentora helps you build meaningful AI tutoring connections with privacy-first account protection.',
    });
  }

  private buildPasswordChangedEmail(
    user: UserDocument,
    source: 'reset' | 'change',
  ) {
    const name = this.getUserDisplayName(user);
    const changedAt = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    }).format(new Date());

    return this.buildSecurityEmail({
      greeting: `Hello ${this.escapeHtml(name)},`,
      eyebrow: 'Account security update',
      heading:
        source === 'reset'
          ? 'Your password has been reset'
          : 'Your password has been changed',
      intro:
        source === 'reset'
          ? 'Your Mentora password was reset successfully. You can now sign in with your new password.'
          : 'Your Mentora password was changed successfully from your account security settings.',
      details: [
        `Changed at: ${this.escapeHtml(changedAt)} IST`,
        'All existing sessions may be reviewed from Security Settings.',
        'If this was not you, contact Mentora support immediately and secure your email account.',
      ],
      footerNote:
        'We send security alerts to help keep your AI tutoring profile and conversations protected.',
    });
  }

  private buildSecurityEmail({
    greeting,
    eyebrow,
    heading,
    intro,
    ctaLabel,
    ctaUrl,
    details,
    footerNote,
  }: {
    greeting: string;
    eyebrow: string;
    heading: string;
    intro: string;
    ctaLabel?: string;
    ctaUrl?: string;
    details: string[];
    footerNote: string;
  }) {
    const detailItems = details
      .map((detail) => `<li>${this.escapeHtml(detail)}</li>`)
      .join('');
    const cta =
      ctaLabel && ctaUrl
        ? `<a href="${this.escapeHtml(
            ctaUrl,
          )}" style="display:inline-block;background:#8b1e3f;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px;margin:10px 0 6px;">${this.escapeHtml(
            ctaLabel,
          )}</a>`
        : '';

    return `<!doctype html>
<html>
  <body style="margin:0;background:#f8f3f5;font-family:Arial,Helvetica,sans-serif;color:#2f2530;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f3f5;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #eadde2;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:#8b1e3f;padding:26px 30px;color:#ffffff;">
                <div style="font-size:12px;letter-spacing:1.6px;text-transform:uppercase;opacity:.86;">${this.escapeHtml(
                  eyebrow,
                )}</div>
                <div style="font-size:28px;font-weight:800;margin-top:8px;">Mentora</div>
                <div style="font-size:14px;opacity:.9;margin-top:6px;">Private, trusted AI tutoring connections</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <p style="font-size:16px;line-height:24px;margin:0 0 14px;">${greeting}</p>
                <h1 style="font-size:24px;line-height:31px;margin:0 0 12px;color:#251b25;">${this.escapeHtml(
                  heading,
                )}</h1>
                <p style="font-size:15px;line-height:24px;margin:0 0 18px;color:#594b55;">${this.escapeHtml(
                  intro,
                )}</p>
                ${cta}
                <div style="background:#fff8fa;border:1px solid #eadde2;border-radius:14px;padding:16px 18px;margin-top:18px;">
                  <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#251b25;">Security details</div>
                  <ul style="margin:0;padding-left:18px;color:#594b55;font-size:14px;line-height:22px;">${detailItems}</ul>
                </div>
                <p style="font-size:13px;line-height:20px;color:#746873;margin:18px 0 0;">${this.escapeHtml(
                  footerNote,
                )}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#fbf8f9;border-top:1px solid #eadde2;padding:18px 30px;color:#7a6d76;font-size:12px;line-height:18px;">
                This is an automated security email from Mentora. Please do not share password reset links with anyone.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  private getUserDisplayName(user: UserDocument) {
    const emailPrefix = user.email?.split('@')[0]?.trim();
    return emailPrefix || 'there';
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
