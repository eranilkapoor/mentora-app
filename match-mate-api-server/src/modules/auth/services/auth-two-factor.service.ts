import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { createHmac, randomBytes, randomUUID } from 'crypto';
import { Model, Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import { AuthProvider } from '../enums/auth-provider.enum';
import { OtpService } from './otp.service';
import { User, UserDocument } from '../schemas/user.schema';
import {
  SecuritySetting,
  SecuritySettingDocument,
} from '@/modules/settings/schemas/security-setting.schema';
import { TwoFactorMethod } from '@/modules/settings/enums/settings-preferences.enums';

type TwoFactorChallengeMethod =
  | TwoFactorMethod.SMS
  | TwoFactorMethod.AUTHENTICATOR;

type TwoFactorChallenge = {
  userId: string;
  provider: AuthProvider;
  source: string;
  method: TwoFactorChallengeMethod;
  createdAt: string;
};

@Injectable()
export class AuthTwoFactorService {
  private readonly issuer = 'Match Mate';
  private readonly challengeTtlSeconds = 5 * 60;

  constructor(
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SecuritySetting.name)
    private readonly securitySettingModel: Model<SecuritySettingDocument>,
    private readonly otpService: OtpService,
  ) {}

  async getStatus(userId: string) {
    const settings = await this.getOrCreateSecurity(userId);
    const user = await this.userModel.findById(userId).lean().exec();
    const invalidSms =
      settings.twoFactorEnabled &&
      settings.twoFactorMethod === TwoFactorMethod.SMS &&
      (!user || !this.hasVerifiedPhone(user));
    const invalidMethod =
      settings.twoFactorEnabled &&
      settings.twoFactorMethod !== TwoFactorMethod.SMS &&
      settings.twoFactorMethod !== TwoFactorMethod.AUTHENTICATOR;

    if (invalidSms || invalidMethod) {
      await this.disableInvalidTwoFactor(userId);
      settings.twoFactorEnabled = false;
      settings.twoFactorMethod = TwoFactorMethod.NONE;
    }

    return {
      enabled: Boolean(settings.twoFactorEnabled),
      method: settings.twoFactorMethod,
      authenticatorConfigured: Boolean(settings.totpSecret),
      recoveryCodesRemaining: settings.recoveryCodeHashes?.length ?? 0,
      recoveryCodesGeneratedAt: settings.recoveryCodesGeneratedAt,
    };
  }

  async setupTotp(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new AppException(
        ErrorCode.AUTH_USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    this.assertHasVerifiedIdentity(user);

    const secret = this.generateBase32Secret();
    const label = encodeURIComponent(user.email ?? String(user._id));
    const issuer = encodeURIComponent(this.issuer);
    const otpauthUrl = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    await this.securitySettingModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: { totpSecret: secret },
        $setOnInsert: { userId: new Types.ObjectId(userId) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return { secret, otpauthUrl };
  }

  async enableTotp(userId: string, code: string) {
    const user = await this.getUserOrThrow(userId);
    this.assertHasVerifiedIdentity(user);

    const settings = await this.getOrCreateSecurity(userId);
    if (!settings.totpSecret || !this.verifyTotp(settings.totpSecret, code)) {
      throw new AppException(
        ErrorCode.AUTH_INVALID_OTP,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const recoveryCodes = this.generateRecoveryCodes();
    const recoveryCodeHashes = await Promise.all(
      recoveryCodes.map((item) => bcrypt.hash(item, 10)),
    );

    await this.securitySettingModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: true,
          twoFactorMethod: TwoFactorMethod.AUTHENTICATOR,
          totpEnabledAt: new Date(),
          recoveryCodeHashes,
          recoveryCodesGeneratedAt: new Date(),
        },
      },
    );

    return {
      enabled: true,
      method: TwoFactorMethod.AUTHENTICATOR,
      recoveryCodes,
    };
  }

  async requestSmsEnable(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const phone = this.getVerifiedPhoneOrThrow(user);

    await this.otpService.generate(phone.countryCode, phone.phone);
    return { sent: true };
  }

  async enableSms(userId: string, code: string) {
    const user = await this.getUserOrThrow(userId);
    const phone = this.getVerifiedPhoneOrThrow(user);

    const valid = this.otpService.verify(phone.countryCode, phone.phone, code);
    if (!valid) {
      throw new AppException(
        ErrorCode.AUTH_INVALID_OTP,
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.securitySettingModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: true,
          twoFactorMethod: TwoFactorMethod.SMS,
        },
        $setOnInsert: { userId: new Types.ObjectId(userId) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return { enabled: true, method: TwoFactorMethod.SMS };
  }

  async disable(userId: string, code?: string) {
    const settings = await this.getOrCreateSecurity(userId);

    if (
      settings.twoFactorEnabled &&
      settings.twoFactorMethod === TwoFactorMethod.AUTHENTICATOR
    ) {
      if (
        !code ||
        !settings.totpSecret ||
        !this.verifyTotp(settings.totpSecret, code)
      ) {
        throw new AppException(
          ErrorCode.AUTH_INVALID_OTP,
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    await this.securitySettingModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: false,
          twoFactorMethod: TwoFactorMethod.NONE,
        },
      },
    );

    return { enabled: false, method: TwoFactorMethod.NONE };
  }

  async regenerateRecoveryCodes(userId: string, code: string) {
    const settings = await this.getOrCreateSecurity(userId);
    if (!settings.totpSecret || !this.verifyTotp(settings.totpSecret, code)) {
      throw new AppException(
        ErrorCode.AUTH_INVALID_OTP,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const recoveryCodes = this.generateRecoveryCodes();
    const recoveryCodeHashes = await Promise.all(
      recoveryCodes.map((item) => bcrypt.hash(item, 10)),
    );

    await this.securitySettingModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          recoveryCodeHashes,
          recoveryCodesGeneratedAt: new Date(),
        },
      },
    );

    return { recoveryCodes };
  }

  async beginChallenge(userId: string, provider: AuthProvider, source: string) {
    const settings = await this.getOrCreateSecurity(userId);
    if (
      !settings.twoFactorEnabled ||
      settings.twoFactorMethod === TwoFactorMethod.NONE
    ) {
      return null;
    }

    if (
      settings.twoFactorMethod !== TwoFactorMethod.SMS &&
      settings.twoFactorMethod !== TwoFactorMethod.AUTHENTICATOR
    ) {
      return null;
    }

    const method = settings.twoFactorMethod;
    if (source === 'login-phone-otp' && method === TwoFactorMethod.SMS) {
      return null;
    }

    const challengeId = randomUUID();

    if (method === TwoFactorMethod.SMS) {
      const user = await this.userModel.findById(userId).lean().exec();
      if (!user || !this.hasVerifiedPhone(user)) {
        await this.disableInvalidTwoFactor(userId);
        return null;
      }
      await this.otpService.generate(user.phone.countryCode, user.phone.phone);
    }

    const challenge: TwoFactorChallenge = {
      userId,
      provider,
      source,
      method,
      createdAt: new Date().toISOString(),
    };

    await this.cache.set(
      this.challengeKey(challengeId),
      JSON.stringify(challenge),
      this.challengeTtlSeconds,
    );

    return {
      requiresTwoFactor: true,
      challengeId,
      method,
      expiresInSeconds: this.challengeTtlSeconds,
    };
  }

  async consumeChallenge(
    challengeId: string,
    code?: string,
    recoveryCode?: string,
  ) {
    const raw = await this.cache.get<string>(this.challengeKey(challengeId));
    if (!raw) {
      throw new AppException(
        ErrorCode.AUTH_SESSION_EXPIRED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const challenge = JSON.parse(raw) as TwoFactorChallenge;
    const settings = await this.getOrCreateSecurity(challenge.userId);

    if (recoveryCode) {
      const ok = await this.consumeRecoveryCode(settings, recoveryCode);
      if (!ok) {
        throw new AppException(
          ErrorCode.AUTH_INVALID_OTP,
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else if (challenge.method === TwoFactorMethod.AUTHENTICATOR) {
      if (
        !code ||
        !settings.totpSecret ||
        !this.verifyTotp(settings.totpSecret, code)
      ) {
        throw new AppException(
          ErrorCode.AUTH_INVALID_OTP,
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else if (challenge.method === TwoFactorMethod.SMS) {
      const user = await this.userModel
        .findById(challenge.userId)
        .lean()
        .exec();
      if (!code || !user?.phone?.countryCode || !user.phone.phone) {
        throw new AppException(
          ErrorCode.AUTH_INVALID_OTP,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const ok = this.otpService.verify(
        user.phone.countryCode,
        user.phone.phone,
        code,
      );
      if (!ok) {
        throw new AppException(
          ErrorCode.AUTH_INVALID_OTP,
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else {
      throw new AppException(
        ErrorCode.AUTH_INVALID_OTP,
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.cache.del(this.challengeKey(challengeId));
    return challenge;
  }

  private async consumeRecoveryCode(
    settings: SecuritySettingDocument,
    recoveryCode: string,
  ): Promise<boolean> {
    const hashes = settings.recoveryCodeHashes ?? [];

    for (const hash of hashes) {
      if (await bcrypt.compare(recoveryCode.toUpperCase(), hash)) {
        await this.securitySettingModel.updateOne(
          { _id: settings._id },
          { $pull: { recoveryCodeHashes: hash } },
        );
        return true;
      }
    }

    return false;
  }

  private async getOrCreateSecurity(
    userId: string,
  ): Promise<SecuritySettingDocument> {
    return this.securitySettingModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  private async getUserOrThrow(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new AppException(
        ErrorCode.AUTH_USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  private assertHasVerifiedIdentity(user: {
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    phone?: { countryCode?: string; phone?: string };
  }) {
    if (user.isEmailVerified || this.hasVerifiedPhone(user)) {
      return;
    }

    throw new AppException(
      ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
      HttpStatus.BAD_REQUEST,
      null,
      undefined,
      { reason: 'verified_email_or_phone_required_for_2fa' },
    );
  }

  private getVerifiedPhoneOrThrow(user: {
    isPhoneVerified?: boolean;
    phone?: { countryCode?: string; phone?: string };
  }): { countryCode: string; phone: string } {
    if (this.hasVerifiedPhone(user)) {
      return user.phone;
    }

    throw new AppException(
      ErrorCode.AUTH_PHONE_NOT_VERIFIED,
      HttpStatus.BAD_REQUEST,
    );
  }

  private hasVerifiedPhone(user: {
    isPhoneVerified?: boolean;
    phone?: { countryCode?: string; phone?: string };
  }): user is {
    isPhoneVerified?: boolean;
    phone: { countryCode: string; phone: string };
  } {
    return Boolean(
      user.isPhoneVerified && user.phone?.countryCode && user.phone.phone,
    );
  }

  private async disableInvalidTwoFactor(userId: string) {
    await this.securitySettingModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: false,
          twoFactorMethod: TwoFactorMethod.NONE,
        },
      },
    );
  }

  private challengeKey(challengeId: string): string {
    return `auth:2fa:${challengeId}`;
  }

  private generateBase32Secret(): string {
    return this.base32Encode(randomBytes(20));
  }

  private generateRecoveryCodes(): string[] {
    return Array.from({ length: 10 }, () =>
      randomBytes(5).toString('hex').toUpperCase(),
    );
  }

  private verifyTotp(secret: string, code: string): boolean {
    const now = Math.floor(Date.now() / 1000 / 30);
    return [-1, 0, 1].some(
      (window) => this.generateTotp(secret, now + window) === code,
    );
  }

  private generateTotp(secret: string, counter: number): string {
    const key = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter));
    const hmac = createHmac('sha1', key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    return String(binary % 1_000_000).padStart(6, '0');
  }

  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  private base32Decode(secret: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (const char of secret.replace(/=+$/g, '').toUpperCase()) {
      const index = alphabet.indexOf(char);
      if (index < 0) continue;
      value = (value << 5) | index;
      bits += 5;
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(bytes);
  }
}
