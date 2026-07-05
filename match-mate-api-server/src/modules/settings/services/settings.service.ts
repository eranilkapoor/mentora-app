import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { Status } from '@/common/enums';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  UserSession,
  UserSessionDocument,
} from '@/modules/auth/schemas/user-session.schema';
import {
  Verification,
  VerificationDocument,
} from '@/modules/safety/schemas/verification.schema';
import {
  UserReport,
  UserReportDocument,
} from '@/modules/safety/schemas/user-report.schema';
import {
  Profile,
  ProfileDocument,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  Media,
  MediaDocument,
} from '@/modules/profiles/schemas/media/media.schema';
import { MediaStatus } from '@/modules/profiles/enums/profile-media.enums';
import { MediaType } from '@/common/enums';
import { ChatRealtimeService } from '@/modules/chat/services/chat-realtime.service';
import {
  ActivityLog,
  ActivityLogDocument,
} from '@/modules/profiles/schemas/settings/activity-logs.schema';
import { ActivityCategory } from '@/modules/profiles/enums/activity-log.enums';
import { SettingsRepository } from '../repositories/settings.repository';
import type { SettingsDeletionResult } from '../interfaces/settings-operation.interface';
import {
  UpdatePrivacySettingsDto,
  BlockUserDto,
  HideProfileDto,
  ReportUserDto,
} from '../dto/privacy-settings.dto';
import {
  NotificationPreferenceParamsDto,
  UpdateNotificationChannelDto,
  UpdateNotificationSettingsDto,
} from '../dto/notification-settings.dto';
import { UpdateCommunicationSettingsDto } from '../dto/communication-settings.dto';
import {
  UpdateSecuritySettingsDto,
  SetAppPinDto,
  RevokeDeviceDto,
} from '../dto/security-settings.dto';
import { UpdateLocalizationSettingsDto } from '../dto/localization-settings.dto';
import { UpdateAccessibilitySettingsDto } from '../dto/accessibility-settings.dto';
import { UpdateMediaSettingsDto } from '../dto/media-settings.dto';
import { UpdateAiSettingsDto } from '../dto/ai-settings.dto';
import {
  DeactivateAccountDto,
  RequestEmailChangeDto,
  RequestPhoneChangeDto,
} from '../dto/account-settings.dto';
import { ErrorCode } from '@/common/constants';
import { throwBadRequest } from '@/common/exceptions/throw-app-exception';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';

@Injectable()
export class SettingsService {
  constructor(
    private readonly repo: SettingsRepository,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSessionDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    @InjectModel(UserReport.name)
    private readonly userReportModel: Model<UserReportDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    private readonly chatRealtimeService: ChatRealtimeService,
  ) {}

  //  All settings in one call

  async getAllSettings(userId: string) {
    const settings = await this.repo.getAllSettings(userId);

    return {
      ...settings,
      account: await this.getAccount(userId),
      localization: this.normalizeLocalization(settings.localization),
    };
  }

  //  Privacy

  getPrivacy(userId: string) {
    return this.repo.getPrivacy(userId);
  }

  updatePrivacy(userId: string, dto: UpdatePrivacySettingsDto) {
    return this.repo.updatePrivacy(userId, dto);
  }

  async blockUser(userId: string, dto: BlockUserDto) {
    if (userId === dto.targetUserId) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'cannot_block_self',
      });
    }
    const block = await this.repo.blockUser(userId, dto.targetUserId);
    this.emitUserBlocked(userId, dto.targetUserId);
    return block;
  }

  async reportUser(userId: string, dto: ReportUserDto) {
    if (userId === dto.targetUserId) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'cannot_report_self',
      });
    }

    const report = await this.userReportModel.findOneAndUpdate(
      {
        reportedBy: new Types.ObjectId(userId),
        reportedUserId: new Types.ObjectId(dto.targetUserId),
      },
      {
        $set: {
          reason: dto.reason ?? 'Reported from app',
        },
        $setOnInsert: {
          reportedBy: new Types.ObjectId(userId),
          reportedUserId: new Types.ObjectId(dto.targetUserId),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await this.repo.blockUser(userId, dto.targetUserId);
    this.emitUserBlocked(userId, dto.targetUserId);

    return report;
  }

  unblockUser(
    userId: string,
    dto: BlockUserDto,
  ): Promise<SettingsDeletionResult> {
    return this.repo.unblockUser(userId, dto.targetUserId);
  }

  async getBlockedUsers(userId: string) {
    const blocks = await this.repo.getBlockedUsers(userId);
    const blockedUserIds = blocks.map((block) =>
      block.blockedUserId.toString(),
    );

    if (blockedUserIds.length === 0) {
      return { blockedUsers: [] };
    }

    const objectIds = blockedUserIds.map((id) => new Types.ObjectId(id));
    const [profiles, media, verifications] = await Promise.all([
      this.profileModel
        .find({
          userId: { $in: objectIds },
        })
        .select('userId personal age')
        .lean<
          Array<{
            userId: Types.ObjectId;
            personal?: {
              firstName?: string;
              lastName?: string;
              city?: string;
              state?: string;
            };
            age?: number;
          }>
        >()
        .exec(),
      this.mediaModel
        .find({
          userId: { $in: blockedUserIds.map((id) => new Types.ObjectId(id)) },
          type: MediaType.IMAGE,
          status: MediaStatus.ACTIVE,
          isActive: true,
        })
        .sort({ isPrimary: -1, uploadedAt: -1, createdAt: -1 })
        .select('userId url thumbnailUrl isPrimary')
        .lean<
          Array<{
            userId: Types.ObjectId;
            url?: string;
            thumbnailUrl?: string;
            isPrimary?: boolean;
          }>
        >()
        .exec(),
      this.verificationModel
        .find({ userId: { $in: objectIds } })
        .select('userId status')
        .lean()
        .exec(),
    ]);

    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );
    const mediaByUserId = new Map<string, (typeof media)[number]>();
    const verificationByUserId = new Map(
      verifications.map((item) => [item.userId.toString(), item.status]),
    );
    media.forEach((item) => {
      const key = item.userId.toString();
      if (!mediaByUserId.has(key)) {
        mediaByUserId.set(key, item);
      }
    });

    return {
      blockedUsers: blocks.map((block) => {
        const blockWithTimestamp = block as typeof block & {
          createdAt?: Date;
        };
        const blockedUserId = block.blockedUserId.toString();
        const profile = profileByUserId.get(blockedUserId);
        const photo = mediaByUserId.get(blockedUserId);
        const name =
          [profile?.personal?.firstName, profile?.personal?.lastName]
            .filter(Boolean)
            .join(' ')
            .trim() || 'Match Mate Member';
        const location =
          [profile?.personal?.city, profile?.personal?.state]
            .filter(Boolean)
            .join(', ') || undefined;

        return {
          userId: blockedUserId,
          name,
          ...(profile?.age ? { age: profile.age } : {}),
          ...(location ? { location } : {}),
          ...(photo?.thumbnailUrl || photo?.url
            ? { avatarUrl: photo.thumbnailUrl ?? photo.url }
            : {}),
          verificationStatus:
            verificationByUserId.get(blockedUserId) ??
            VerificationStatus.NOT_STARTED,
          ...(blockWithTimestamp.createdAt instanceof Date
            ? { blockedAt: blockWithTimestamp.createdAt.toISOString() }
            : {}),
        };
      }),
    };
  }

  getBlockedRelationUserIds(userId: string) {
    return this.repo.getBlockedRelationUserIds(userId);
  }

  async getUnavailableRelationUserIds(userId: string) {
    const [blockedUserIds, hiddenUserIds] = await Promise.all([
      this.repo.getBlockedRelationUserIds(userId),
      this.repo.getHiddenRelationUserIds(userId),
    ]);

    return [...new Set([...blockedUserIds, ...hiddenUserIds])];
  }

  isBlockedBetween(userId: string, targetUserId: string) {
    return this.repo.isBlockedBetween(userId, targetUserId);
  }

  isHiddenBetween(userId: string, targetUserId: string) {
    return this.repo.isHiddenBetween(userId, targetUserId);
  }

  async hideProfile(userId: string, dto: HideProfileDto) {
    if (userId === dto.targetUserId) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'cannot_hide_self',
      });
    }

    return this.repo.hideProfile(userId, dto.targetUserId, dto.reason);
  }

  unhideProfile(
    userId: string,
    dto: BlockUserDto,
  ): Promise<SettingsDeletionResult> {
    return this.repo.unhideProfile(userId, dto.targetUserId);
  }

  async getHiddenProfiles(userId: string) {
    const rows = await this.repo.getHiddenProfiles(userId);
    const hiddenUserIds = rows.map((row) => row.hiddenUserId.toString());

    if (hiddenUserIds.length === 0) {
      return { hiddenProfiles: [] };
    }

    const objectIds = hiddenUserIds.map((id) => new Types.ObjectId(id));
    const [profiles, media, verifications] = await Promise.all([
      this.profileModel
        .find({
          userId: { $in: objectIds },
        })
        .select('userId personal age')
        .lean<
          Array<{
            userId: Types.ObjectId;
            personal?: {
              firstName?: string;
              lastName?: string;
              city?: string;
              state?: string;
            };
            age?: number;
          }>
        >()
        .exec(),
      this.mediaModel
        .find({
          userId: { $in: hiddenUserIds.map((id) => new Types.ObjectId(id)) },
          type: MediaType.IMAGE,
          status: MediaStatus.ACTIVE,
          isActive: true,
        })
        .sort({ isPrimary: -1, uploadedAt: -1, createdAt: -1 })
        .select('userId url thumbnailUrl isPrimary')
        .lean<
          Array<{
            userId: Types.ObjectId;
            url?: string;
            thumbnailUrl?: string;
            isPrimary?: boolean;
          }>
        >()
        .exec(),
      this.verificationModel
        .find({ userId: { $in: objectIds } })
        .select('userId status')
        .lean()
        .exec(),
    ]);

    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );
    const mediaByUserId = new Map<string, (typeof media)[number]>();
    const verificationByUserId = new Map(
      verifications.map((item) => [item.userId.toString(), item.status]),
    );
    media.forEach((item) => {
      const key = item.userId.toString();
      if (!mediaByUserId.has(key)) {
        mediaByUserId.set(key, item);
      }
    });

    return {
      hiddenProfiles: rows.map((row) => {
        const rowWithTimestamp = row as typeof row & {
          createdAt?: Date;
        };
        const hiddenUserId = row.hiddenUserId.toString();
        const profile = profileByUserId.get(hiddenUserId);
        const photo = mediaByUserId.get(hiddenUserId);
        const name =
          [profile?.personal?.firstName, profile?.personal?.lastName]
            .filter(Boolean)
            .join(' ')
            .trim() || 'Match Mate Member';
        const location =
          [profile?.personal?.city, profile?.personal?.state]
            .filter(Boolean)
            .join(', ') || undefined;

        return {
          userId: hiddenUserId,
          name,
          ...(profile?.age ? { age: profile.age } : {}),
          ...(location ? { location } : {}),
          ...(photo?.thumbnailUrl || photo?.url
            ? { avatarUrl: photo.thumbnailUrl ?? photo.url }
            : {}),
          verificationStatus:
            verificationByUserId.get(hiddenUserId) ??
            VerificationStatus.NOT_STARTED,
          ...(row.reason ? { reason: row.reason } : {}),
          ...(rowWithTimestamp.createdAt instanceof Date
            ? { hiddenAt: rowWithTimestamp.createdAt.toISOString() }
            : {}),
        };
      }),
    };
  }

  private emitUserBlocked(blockerId: string, blockedUserId: string) {
    const payload = {
      blockerId,
      blockedUserId,
      blockedAt: new Date().toISOString(),
    };

    this.chatRealtimeService.emitToUser(blockerId, 'user:blocked', payload);
    this.chatRealtimeService.emitToUser(blockedUserId, 'user:blocked', payload);
  }

  //  Account

  async getAccount(userId: string) {
    const [account, user] = await Promise.all([
      this.repo.getAccount(userId),
      this.userModel.findById(userId).lean().exec(),
    ]);
    const verification = await this.verificationModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();

    const accountData: Record<string, unknown> =
      typeof account?.toObject === 'function'
        ? (account.toObject() as Record<string, unknown>)
        : ((account as Record<string, unknown> | null) ?? {});
    const linkedAccounts = this.buildLinkedAccounts(user ?? undefined);

    return {
      ...accountData,
      linkedAccounts,
      emailVerified: Boolean(user?.isEmailVerified),
      phoneVerified: Boolean(user?.isPhoneVerified),
      profileVerification: {
        status: verification?.status ?? VerificationStatus.NOT_STARTED,
        provider: verification?.provider,
        verifiedAt: verification?.verifiedAt,
      },
    };
  }

  async deactivateAccount(userId: string, dto: DeactivateAccountDto) {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { status: Status.INACTIVE },
    });
    await this.userSessionModel.updateMany(
      { userId: new Types.ObjectId(userId), isActive: true },
      { $set: { isActive: false, loggedOutAt: new Date() } },
    );

    return this.repo.updateAccount(userId, {
      isDeactivated: true,
      deactivatedAt: new Date(),
      deactivationReason: dto.reason,
    });
  }

  async scheduleAccountDeletion(userId: string) {
    const deletionScheduledAt = new Date();
    deletionScheduledAt.setDate(deletionScheduledAt.getDate() + 30);

    await this.userModel.findByIdAndUpdate(userId, {
      $set: { status: Status.INACTIVE },
    });
    await this.userSessionModel.updateMany(
      { userId: new Types.ObjectId(userId), isActive: true },
      { $set: { isActive: false, loggedOutAt: new Date() } },
    );

    return this.repo.updateAccount(userId, { deletionScheduledAt });
  }

  async disconnectLinkedAccount(userId: string, provider: string) {
    const authProvider = this.toAuthProvider(provider);
    if (!authProvider) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'unsupported_linked_account_provider',
        provider,
      });
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'user_not_found',
      });
    }

    const targetIndexes = user.authAccounts
      .map((account, index) => ({
        index,
        provider: String(account.provider),
      }))
      .filter((account) => account.provider === String(authProvider))
      .map((account) => account.index);
    const targetIndexSet = new Set(targetIndexes);

    const hasProvider = user.authAccounts.some(
      (account) => String(account.provider) === String(authProvider),
    );

    if (!hasProvider) {
      return this.getAccount(userId);
    }

    const targetIsPrimary = targetIndexes.some(
      (index) => user.authAccounts[index]?.isPrimary,
    );
    if (targetIsPrimary) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'primary_login_method',
        provider: authProvider,
      });
    }

    const remainingUsableAccounts = this.getUsableAuthAccounts(
      user.authAccounts.filter((_, index) => !targetIndexSet.has(index)),
    );

    if (remainingUsableAccounts.length === 0) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'last_login_method',
        provider: authProvider,
      });
    }

    user.authAccounts = user.authAccounts.filter(
      (_, index) => !targetIndexSet.has(index),
    );

    await user.save();

    return this.getAccount(userId);
  }

  async setPrimaryLinkedAccount(userId: string, provider: string) {
    const authProvider = this.toAuthProvider(provider);
    if (!authProvider) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'unsupported_linked_account_provider',
        provider,
      });
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'user_not_found',
      });
    }
    const target = user.authAccounts.find(
      (account) => String(account.provider) === String(authProvider),
    );
    if (!target || !this.isUsableAuthAccount(target)) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'login_method_not_connected',
        provider: authProvider,
      });
    }
    user.authAccounts.forEach((account) => {
      account.isPrimary = account === target;
    });
    await user.save();
    return this.getAccount(userId);
  }

  requestEmailChange(_userId: string, dto: RequestEmailChangeDto) {
    return { email: dto.email, verificationRequired: true };
  }

  requestPhoneChange(_userId: string, dto: RequestPhoneChangeDto) {
    return {
      countryCode: dto.countryCode,
      phone: dto.phone,
      verificationRequired: true,
    };
  }

  //  Notifications

  getOrCreateUserSettings(userId: string) {
    return this.repo.getOrCreateUserSettings(userId);
  }

  getOrCreateAllUserSettings(userId: string) {
    return this.repo.getOrCreateAllUserSettings(userId);
  }

  getNotification(userId: string) {
    return this.repo.getNotification(userId);
  }

  updateNotification(userId: string, dto: UpdateNotificationSettingsDto) {
    // Flatten per-event preferences into the preferences sub-document
    const {
      interestReceived,
      interestAccepted,
      profileView,
      matchFound,
      messageReceived,
      subscription,
      marketing,
      system,
      quietHours,
      ...globalToggles
    } = dto;

    const update: Record<string, unknown> = { ...globalToggles };

    if (interestReceived)
      update['preferences.interestReceived'] = interestReceived;
    if (interestAccepted)
      update['preferences.interestAccepted'] = interestAccepted;
    if (profileView) update['preferences.profileView'] = profileView;
    if (matchFound) update['preferences.matchFound'] = matchFound;
    if (messageReceived)
      update['preferences.messageReceived'] = messageReceived;
    if (subscription) update['preferences.subscription'] = subscription;
    if (marketing) update['preferences.marketing'] = marketing;
    if (system) update['preferences.system'] = system;
    if (quietHours) update['quietHours'] = quietHours;

    return this.repo.updateNotification(userId, update);
  }

  updateNotificationChannel(
    userId: string,
    params: NotificationPreferenceParamsDto,
    dto: UpdateNotificationChannelDto,
  ) {
    return this.repo.updateNotification(userId, {
      [`preferences.${params.event}.${params.channel}`]: dto.value,
    });
  }

  //  Communication

  getCommunication(userId: string) {
    return this.repo.getCommunication(userId);
  }

  updateCommunication(userId: string, dto: UpdateCommunicationSettingsDto) {
    return this.repo.updateCommunication(userId, dto);
  }

  //  Security

  getSecurity(userId: string) {
    return this.repo.getSecurity(userId);
  }

  updateSecurity(userId: string, dto: UpdateSecuritySettingsDto) {
    const { twoFactorEnabled, twoFactorMethod, ...safeDto } = dto;
    void twoFactorEnabled;
    void twoFactorMethod;
    return this.repo.updateSecurity(userId, safeDto);
  }

  async setAppPin(userId: string, dto: SetAppPinDto) {
    const pinHash = await bcrypt.hash(dto.pin, 10);
    return this.repo.updateSecurity(userId, {
      appPinEnabled: true,
      appPinHash: pinHash,
    });
  }

  async disableAppPin(userId: string) {
    return this.repo.updateSecurity(userId, {
      appPinEnabled: false,
      appPinHash: undefined,
    });
  }

  revokeDevice(userId: string, dto: RevokeDeviceDto) {
    return this.repo.revokeDevice(userId, dto.deviceId);
  }

  async revokeSession(userId: string, sessionId: string) {
    if (!Types.ObjectId.isValid(sessionId)) {
      return throwBadRequest(ErrorCode.INVALID_ID, {
        reason: 'invalid_session_id',
      });
    }

    await this.userSessionModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
      },
      {
        $set: {
          isActive: false,
          loggedOutAt: new Date(),
        },
      },
    );

    return { sessionId, revoked: true };
  }

  revokeAllDevices(userId: string) {
    return this.repo.revokeAllDevices(userId);
  }

  async getLoginHistory(userId: string) {
    const objectUserId = new Types.ObjectId(userId);
    const [sessions, activities] = await Promise.all([
      this.userSessionModel
        .find({ userId: objectUserId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select('-refreshToken')
        .lean()
        .exec(),
      this.activityLogModel
        .find({
          userId: objectUserId,
          category: ActivityCategory.AUTH,
        })
        .sort({ createdAt: -1 })
        .limit(75)
        .lean()
        .exec(),
    ]);

    return {
      sessions: sessions.map((session) => {
        const item = session as typeof session & {
          _id: Types.ObjectId;
          createdAt?: Date;
          updatedAt?: Date;
        };
        const isExpired = item.expiresAt
          ? new Date(item.expiresAt).getTime() <= Date.now()
          : false;

        return {
          sessionId: item._id.toString(),
          device: item.device,
          ip: item.ip,
          userAgent: item.userAgent,
          isActive: Boolean(item.isActive && !isExpired),
          status: item.loggedOutAt
            ? 'signed_out'
            : isExpired
              ? 'expired'
              : item.isActive
                ? 'active'
                : 'inactive',
          signedInAt: item.createdAt,
          lastActiveAt: item.updatedAt,
          expiresAt: item.expiresAt,
          loggedOutAt: item.loggedOutAt,
        };
      }),
      timeline: activities.map((activity) => {
        const item = activity as typeof activity & {
          _id: Types.ObjectId;
          createdAt?: Date;
        };

        return {
          id: item._id.toString(),
          category: item.category,
          action: item.action,
          ip: item.ip,
          device: item.device,
          userAgent: item.userAgent,
          platform: item.platform,
          metadata: item.metadata ?? {},
          createdAt: item.createdAt,
        };
      }),
    };
  }

  //  Localization

  async getLocalization(userId: string) {
    return this.normalizeLocalization(await this.repo.getLocalization(userId));
  }

  async updateLocalization(userId: string, dto: UpdateLocalizationSettingsDto) {
    return this.normalizeLocalization(
      await this.repo.updateLocalization(userId, dto),
    );
  }

  //  Accessibility

  getAccessibility(userId: string) {
    return this.repo.getAccessibility(userId);
  }

  updateAccessibility(userId: string, dto: UpdateAccessibilitySettingsDto) {
    return this.repo.updateAccessibility(userId, dto);
  }

  //  Media

  getMedia(userId: string) {
    return this.repo.getMedia(userId);
  }

  updateMedia(userId: string, dto: UpdateMediaSettingsDto) {
    return this.repo.updateMedia(userId, dto);
  }

  //  AI

  getAi(userId: string) {
    return this.repo.getAi(userId);
  }

  updateAi(userId: string, dto: UpdateAiSettingsDto) {
    return this.repo.updateAi(userId, dto);
  }

  private normalizeLocalization(settings: unknown) {
    const localization =
      settings && typeof settings === 'object'
        ? (settings as Record<string, unknown>)
        : {};

    return {
      ...localization,
      shareLocation: Boolean(localization.shareLocation),
    };
  }

  private buildLinkedAccounts(user?: {
    authAccounts?: Array<{
      provider?: AuthProvider | string;
      providerId?: string;
      passwordHash?: string;
      isVerified?: boolean;
      isPrimary?: boolean;
      lastUsedAt?: Date;
    }>;
  }) {
    const providers = [
      AuthProvider.EMAIL,
      AuthProvider.PHONE,
      AuthProvider.GOOGLE,
      AuthProvider.FACEBOOK,
      AuthProvider.APPLE,
    ].map(String);
    const authAccounts = user?.authAccounts ?? [];
    const usableAuthAccounts = this.getUsableAuthAccounts(authAccounts);

    const effectivePrimary =
      usableAuthAccounts.find((item) => item.isPrimary) ??
      usableAuthAccounts[0];

    return providers.map((provider) => {
      const account = authAccounts.find(
        (item) => String(item.provider) === provider,
      );
      const connected = Boolean(account);
      const remainingUsableAccounts = usableAuthAccounts.filter(
        (item) => String(item.provider) !== provider,
      );
      const isPrimary =
        connected &&
        String(effectivePrimary?.provider ?? '') === String(provider);
      const canDisconnect =
        connected && !isPrimary && remainingUsableAccounts.length > 0;

      return {
        provider,
        providerId: account?.providerId,
        connected,
        connectedAt: account?.lastUsedAt,
        isVerified: Boolean(account?.isVerified),
        isPrimary,
        canDisconnect,
        ...(!canDisconnect && connected
          ? {
              disconnectReason: isPrimary
                ? 'primary_login_method'
                : 'last_login_method',
            }
          : {}),
      };
    });
  }

  private toAuthProvider(provider: string): AuthProvider | undefined {
    const normalizedProvider = provider.toLowerCase();
    const providers = [
      AuthProvider.EMAIL,
      AuthProvider.PHONE,
      AuthProvider.GOOGLE,
      AuthProvider.FACEBOOK,
      AuthProvider.APPLE,
    ].map(String);

    return providers.find((item) => item === normalizedProvider) as
      | AuthProvider
      | undefined;
  }

  private isUsableAuthAccount(account?: {
    provider?: AuthProvider | string;
    passwordHash?: string;
  }): boolean {
    const provider = String(account?.provider ?? '');

    if (!provider) {
      return false;
    }

    if (provider === String(AuthProvider.EMAIL)) {
      return Boolean(account?.passwordHash);
    }

    return [
      AuthProvider.PHONE,
      AuthProvider.GOOGLE,
      AuthProvider.FACEBOOK,
      AuthProvider.APPLE,
    ]
      .map(String)
      .includes(provider);
  }

  private getUsableAuthAccounts<
    T extends { provider?: AuthProvider | string; passwordHash?: string },
  >(authAccounts: T[]): T[] {
    return authAccounts.filter((account) => this.isUsableAuthAccount(account));
  }
}
