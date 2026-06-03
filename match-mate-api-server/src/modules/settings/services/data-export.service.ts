import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

type ExportDocument = Record<string, unknown>;

const SECRET_KEYS = new Set([
  'password',
  'passwordHash',
  'refreshToken',
  'refreshTokenHash',
  'accessToken',
  'otp',
  'otpHash',
  'appPinHash',
  'totpSecret',
  'recoveryCodes',
  'gatewayPayload',
  '__v',
]);

@Injectable()
export class DataExportService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async exportUserData(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const byUserId = { userId: userObjectId };

    const settings = await this.getSettings(byUserId);
    const [
      user,
      profile,
      preference,
      media,
      sessions,
      notifications,
      subscriptions,
      payments,
      referrals,
      blocks,
      hiddenProfiles,
      reports,
      consents,
      activityLogs,
    ] = await Promise.all([
      this.collection(COLLECTION_NAMES.USER).findOne({ _id: userObjectId }),
      this.collection(COLLECTION_NAMES.PROFILE).findOne(byUserId),
      this.collection(COLLECTION_NAMES.PREFERENCE).findOne(byUserId),
      this.collection(COLLECTION_NAMES.MEDIA).find(byUserId).toArray(),
      this.collection(COLLECTION_NAMES.USER_SESSION).find(byUserId).toArray(),
      this.collection(COLLECTION_NAMES.NOTIFICATION).find(byUserId).toArray(),
      this.collection(COLLECTION_NAMES.SUBSCRIPTION).find(byUserId).toArray(),
      this.collection(COLLECTION_NAMES.PAYMENT).find(byUserId).toArray(),
      this.collection(COLLECTION_NAMES.REFERRAL_REWARD)
        .find({
          $or: [{ referrerId: userObjectId }, { referredUserId: userObjectId }],
        })
        .toArray(),
      this.collection(COLLECTION_NAMES.USER_BLOCK).find(byUserId).toArray(),
      this.collection(COLLECTION_NAMES.USER_PROFILE_HIDE)
        .find(byUserId)
        .toArray(),
      this.collection(COLLECTION_NAMES.USER_REPORT)
        .find({
          $or: [{ reportedBy: userObjectId }, { reportedUserId: userObjectId }],
        })
        .toArray(),
      this.collection(COLLECTION_NAMES.USER_CONSENT).find(byUserId).toArray(),
      this.collection(COLLECTION_NAMES.ACTIVITY_LOG).find(byUserId).toArray(),
    ]);

    return this.sanitize({
      exportedAt: new Date(),
      user,
      profile,
      preference,
      media,
      settings,
      sessions,
      notifications,
      subscriptions,
      payments,
      referrals,
      privacyControls: {
        blocks,
        hiddenProfiles,
        reports,
        consents,
      },
      activityLogs,
    });
  }

  private getSettings(userFilter: {
    userId: Types.ObjectId;
  }): Promise<Record<string, unknown>> {
    return Promise.all(
      (
        [
          ['account', COLLECTION_NAMES.ACCOUNT_SETTING],
          ['privacy', COLLECTION_NAMES.PRIVACY_SETTING],
          ['notification', COLLECTION_NAMES.NOTIFICATION_SETTING],
          ['communication', COLLECTION_NAMES.COMMUNICATION_SETTING],
          ['security', COLLECTION_NAMES.SECURITY_SETTING],
          ['localization', COLLECTION_NAMES.LOCALIZATION_SETTING],
          ['accessibility', COLLECTION_NAMES.ACCESSIBILITY_SETTING],
          ['media', COLLECTION_NAMES.MEDIA_SETTING],
          ['ai', COLLECTION_NAMES.AI_SETTING],
        ] satisfies Array<[string, string]>
      ).map(
        async ([key, collectionName]): Promise<[string, unknown]> => [
          key,
          await this.collection(collectionName).findOne(userFilter),
        ],
      ),
    ).then((entries) => Object.fromEntries(entries));
  }

  private collection(name: string) {
    return this.connection.collection<ExportDocument>(name);
  }

  private sanitize(value: unknown): unknown {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .filter(([key]) => !SECRET_KEYS.has(key))
          .map(([key, item]) => [key, this.sanitize(item)]),
      );
    }

    return value;
  }
}
