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

const SETTINGS_EXPORT_COLLECTIONS = [
  ['account', COLLECTION_NAMES.ACCOUNT_SETTING],
  ['privacy', COLLECTION_NAMES.PRIVACY_SETTING],
  ['notification', COLLECTION_NAMES.NOTIFICATION_SETTING],
  ['communication', COLLECTION_NAMES.COMMUNICATION_SETTING],
  ['security', COLLECTION_NAMES.SECURITY_SETTING],
  ['localization', COLLECTION_NAMES.LOCALIZATION_SETTING],
  ['accessibility', COLLECTION_NAMES.ACCESSIBILITY_SETTING],
  ['media', COLLECTION_NAMES.MEDIA_SETTING],
  ['ai', COLLECTION_NAMES.AI_SETTING],
] satisfies Array<[string, string]>;

export const USER_DATA_EXPORT_COLLECTIONS = {
  user: COLLECTION_NAMES.USER,
  profile: COLLECTION_NAMES.PROFILE,
  preference: COLLECTION_NAMES.PREFERENCE,
  media: COLLECTION_NAMES.MEDIA,
  sessions: COLLECTION_NAMES.USER_SESSION,
  notifications: COLLECTION_NAMES.NOTIFICATION,
  notificationLogs: COLLECTION_NAMES.NOTIFICATION_LOG,
  subscriptions: COLLECTION_NAMES.SUBSCRIPTION,
  payments: COLLECTION_NAMES.PAYMENT,
  invoices: COLLECTION_NAMES.PAYMENT_INVOICE,
  referrals: COLLECTION_NAMES.REFERRAL_REWARD,
  walletTransactions: COLLECTION_NAMES.WALLET_TRANSACTION,
  blocks: COLLECTION_NAMES.USER_BLOCK,
  hiddenProfiles: COLLECTION_NAMES.USER_PROFILE_HIDE,
  reports: COLLECTION_NAMES.USER_REPORT,
  consents: COLLECTION_NAMES.USER_CONSENT,
  activityLogs: COLLECTION_NAMES.ACTIVITY_LOG,
  interests: COLLECTION_NAMES.INTEREST,
  matches: COLLECTION_NAMES.MATCH,
  curatedMatches: COLLECTION_NAMES.CURATED_MATCH,
  chatRooms: COLLECTION_NAMES.CHAT_ROOM,
  chatMessages: COLLECTION_NAMES.CHAT_MESSAGE,
  verification: COLLECTION_NAMES.VERIFICATION,
  analyticsEvents: COLLECTION_NAMES.ANALYTICS_EVENT,
  supportTickets: COLLECTION_NAMES.SUPPORT_TICKET,
  successStories: COLLECTION_NAMES.SUCCESS_STORY,
} as const;

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
      invoices,
      referrals,
      walletTransactions,
      blocks,
      hiddenProfiles,
      reports,
      consents,
      activityLogs,
      interests,
      matches,
      curatedMatches,
      chatRooms,
      chatMessages,
      verification,
      analyticsEvents,
      supportTickets,
      successStories,
    ] = await Promise.all([
      this.collection(USER_DATA_EXPORT_COLLECTIONS.user).findOne({
        _id: userObjectId,
      }),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.profile).findOne(byUserId),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.preference).findOne(
        byUserId,
      ),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.media)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.sessions)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.notifications)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.notificationLogs)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.subscriptions)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.payments)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.invoices)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.referrals)
        .find({
          $or: [{ referrerId: userObjectId }, { referredUserId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.walletTransactions)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.blocks)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.hiddenProfiles)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.reports)
        .find({
          $or: [{ reportedBy: userObjectId }, { reportedUserId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.consents)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.activityLogs)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.interests)
        .find({
          $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.matches)
        .find({
          $or: [{ userId: userObjectId }, { targetUserId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.curatedMatches)
        .find({
          $or: [{ userId: userObjectId }, { profileUserId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.chatRooms)
        .find({ participants: userObjectId })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.chatMessages)
        .find({
          $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.verification).findOne(
        byUserId,
      ),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.analyticsEvents)
        .find({ userId })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.supportTickets)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.successStories)
        .find(byUserId)
        .toArray(),
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
      invoices,
      referrals,
      walletTransactions,
      relationships: {
        interests,
        matches,
        curatedMatches,
      },
      chat: {
        rooms: chatRooms,
        messages: chatMessages,
      },
      verification,
      analyticsEvents,
      supportTickets,
      successStories,
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
      SETTINGS_EXPORT_COLLECTIONS.map(
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
