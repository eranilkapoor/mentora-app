import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AccountSetting,
  AccountSettingDocument,
} from '../schemas/account-settings.schema';
import {
  PrivacySetting,
  PrivacySettingDocument,
} from '../schemas/privacy-settings.schema';
import {
  NotificationSetting,
  NotificationSettingDocument,
} from '../schemas/notification-settings.schema';
import {
  CommunicationSetting,
  CommunicationSettingDocument,
} from '../schemas/communication-settings.schema';
import {
  SecuritySetting,
  SecuritySettingDocument,
} from '../schemas/security-settings.schema';
import {
  LocalizationSetting,
  LocalizationSettingDocument,
} from '../schemas/localization-settings.schema';
import {
  AccessibilitySetting,
  AccessibilitySettingDocument,
} from '../schemas/accessibility-settings.schema';
import {
  MediaSetting,
  MediaSettingDocument,
} from '../schemas/media-settings.schema';
import { AiSetting, AiSettingDocument } from '../schemas/ai-settings.schema';
import {
  UserBlock,
  UserBlockDocument,
} from 'src/modules/safety/schemas/user-block.schema';

function buildDotNotation(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Types.ObjectId) &&
      !(value instanceof Date)
    ) {
      Object.assign(
        result,
        buildDotNotation(value as Record<string, unknown>, fullKey),
      );
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

const upsertOptions = {
  upsert: true,
  new: true,
  runValidators: true,
  setDefaultsOnInsert: true,
} as const;

@Injectable()
export class SettingsRepository {
  constructor(
    @InjectModel(AccountSetting.name)
    private readonly accountModel: Model<AccountSettingDocument>,

    @InjectModel(PrivacySetting.name)
    private readonly privacyModel: Model<PrivacySettingDocument>,

    @InjectModel(NotificationSetting.name)
    private readonly notificationModel: Model<NotificationSettingDocument>,

    @InjectModel(CommunicationSetting.name)
    private readonly communicationModel: Model<CommunicationSettingDocument>,

    @InjectModel(SecuritySetting.name)
    private readonly securityModel: Model<SecuritySettingDocument>,

    @InjectModel(LocalizationSetting.name)
    private readonly localizationModel: Model<LocalizationSettingDocument>,

    @InjectModel(AccessibilitySetting.name)
    private readonly accessibilityModel: Model<AccessibilitySettingDocument>,

    @InjectModel(MediaSetting.name)
    private readonly mediaModel: Model<MediaSettingDocument>,

    @InjectModel(AiSetting.name)
    private readonly aiModel: Model<AiSettingDocument>,

    @InjectModel(UserBlock.name)
    private readonly userBlockModel: Model<UserBlockDocument>,
  ) {}

  async getOrCreateUserSettings(userId: string) {
    const existing = await this.getNotification(userId);

    if (existing) {
      return existing;
    }

    const created = await this.updateNotification(userId, {
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      doNotDisturb: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
        timezone: 'UTC',
      },
      preferences: {
        interestReceived: { inApp: true, push: true, email: true, sms: false },
        interestAccepted: { inApp: true, push: true, email: true, sms: false },
        profileView: { inApp: true, push: false, email: false, sms: false },
        matchFound: { inApp: true, push: true, email: true, sms: false },
        messageReceived: { inApp: true, push: true, email: false, sms: false },
        subscription: { inApp: true, push: true, email: true, sms: false },
        system: { inApp: true, push: true, email: true, sms: false },
        marketing: { inApp: false, push: false, email: true, sms: false },
      },
    });

    return created.toObject();
  }

  async getOrCreateAllUserSettings(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const filter = { userId: userObjectId };
    const insert = { userId: userObjectId };

    const [
      account,
      privacy,
      notification,
      communication,
      security,
      localization,
      accessibility,
      media,
      ai,
    ] = await Promise.all([
      this.accountModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
      this.privacyModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
      this.notificationModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
      this.communicationModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
      this.securityModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .select('-appPinHash')
        .lean()
        .exec(),
      this.localizationModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
      this.accessibilityModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
      this.mediaModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
      this.aiModel
        .findOneAndUpdate(filter, { $setOnInsert: insert }, upsertOptions)
        .lean()
        .exec(),
    ]);

    return {
      account,
      privacy,
      notification,
      communication,
      security,
      localization,
      accessibility,
      media,
      ai,
    };
  }

  //  Getters

  getAccount(userId: string) {
    return this.accountModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  getPrivacy(userId: string) {
    return this.privacyModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  getNotification(userId: string) {
    return this.notificationModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  getCommunication(userId: string) {
    return this.communicationModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  getSecurity(userId: string) {
    return this.securityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .select('-appPinHash') // never expose pin hash
      .lean()
      .exec();
  }

  getLocalization(userId: string) {
    return this.localizationModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  getAccessibility(userId: string) {
    return this.accessibilityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  getMedia(userId: string) {
    return this.mediaModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  getAi(userId: string) {
    return this.aiModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  //  Updaters

  private uid(userId: string) {
    return { userId: new Types.ObjectId(userId) };
  }

  updateAccount(userId: string, data: Partial<AccountSetting>) {
    return this.accountModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  updatePrivacy(userId: string, data: Partial<PrivacySetting>) {
    return this.privacyModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  async updateNotification(userId: string, data: Partial<NotificationSetting>) {
    const updated = await this.notificationModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );

    if (!updated) {
      throw new Error('Failed to update notification settings');
    }

    return updated;
  }

  updateCommunication(userId: string, data: Partial<CommunicationSetting>) {
    return this.communicationModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  updateSecurity(userId: string, data: Partial<SecuritySetting>) {
    return this.securityModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  updateLocalization(userId: string, data: Partial<LocalizationSetting>) {
    return this.localizationModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  updateAccessibility(userId: string, data: Partial<AccessibilitySetting>) {
    return this.accessibilityModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  updateMedia(userId: string, data: Partial<MediaSetting>) {
    return this.mediaModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  updateAi(userId: string, data: Partial<AiSetting>) {
    return this.aiModel.findOneAndUpdate(
      this.uid(userId),
      { $set: buildDotNotation(data as Record<string, unknown>) },
      upsertOptions,
    );
  }

  //  Block / unblock

  blockUser(userId: string, targetUserId: string) {
    return this.userBlockModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        blockedUserId: new Types.ObjectId(targetUserId),
      },
      {
        $setOnInsert: {
          userId: new Types.ObjectId(userId),
          blockedUserId: new Types.ObjectId(targetUserId),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  unblockUser(userId: string, targetUserId: string) {
    return this.userBlockModel
      .deleteOne({
        userId: new Types.ObjectId(userId),
        blockedUserId: new Types.ObjectId(targetUserId),
      })
      .exec();
  }

  async getBlockedUsers(userId: string) {
    return this.userBlockModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getBlockedRelationUserIds(userId: string): Promise<string[]> {
    const uid = new Types.ObjectId(userId);
    const blocks = await this.userBlockModel
      .find({
        $or: [{ userId: uid }, { blockedUserId: uid }],
      })
      .select('userId blockedUserId')
      .lean<Array<{ userId: Types.ObjectId; blockedUserId: Types.ObjectId }>>()
      .exec();

    return [
      ...new Set(
        blocks.map((block) =>
          block.userId.equals(uid)
            ? block.blockedUserId.toString()
            : block.userId.toString(),
        ),
      ),
    ];
  }

  async isBlockedBetween(userId: string, targetUserId: string) {
    const block = await this.userBlockModel
      .findOne({
        $or: [
          {
            userId: new Types.ObjectId(userId),
            blockedUserId: new Types.ObjectId(targetUserId),
          },
          {
            userId: new Types.ObjectId(targetUserId),
            blockedUserId: new Types.ObjectId(userId),
          },
        ],
      })
      .lean()
      .exec();

    return Boolean(block);
  }

  //  Security: Device management

  revokeDevice(userId: string, deviceId: string) {
    return this.securityModel.findOneAndUpdate(
      this.uid(userId),
      { $pull: { loginDevices: { deviceId } } },
      { new: true },
    );
  }

  revokeAllDevices(userId: string) {
    return this.securityModel.findOneAndUpdate(
      this.uid(userId),
      { $set: { loginDevices: [] } },
      { new: true },
    );
  }

  //  Get all settings in one call

  async getAllSettings(userId: string) {
    const [
      account,
      privacy,
      notification,
      communication,
      security,
      localization,
      accessibility,
      media,
      ai,
    ] = await Promise.all([
      this.getAccount(userId),
      this.getPrivacy(userId),
      this.getNotification(userId),
      this.getCommunication(userId),
      this.getSecurity(userId),
      this.getLocalization(userId),
      this.getAccessibility(userId),
      this.getMedia(userId),
      this.getAi(userId),
    ]);

    return {
      account: account ?? {},
      privacy: privacy ?? {},
      notification: notification ?? {},
      communication: communication ?? {},
      security: security ?? {},
      localization: localization ?? {},
      accessibility: accessibility ?? {},
      media: media ?? {},
      ai: ai ?? {},
    };
  }
}
