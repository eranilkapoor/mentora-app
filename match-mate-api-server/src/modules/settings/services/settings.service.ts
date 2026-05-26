import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { Status } from 'src/common/enums';
import { User, UserDocument } from 'src/modules/auth/schemas/user.schema';
import {
  UserSession,
  UserSessionDocument,
} from 'src/modules/auth/schemas/user-session.schema';
import {
  Verification,
  VerificationDocument,
} from 'src/modules/safety/schemas/verification.schema';
import {
  UserReport,
  UserReportDocument,
} from 'src/modules/safety/schemas/user-report.schema';
import {
  Profile,
  ProfileDocument,
} from 'src/modules/profile/schemas/profile/profile.schema';
import {
  Media,
  MediaDocument,
  MediaStatus,
} from 'src/modules/profile/schemas/media/media.schema';
import { MediaType } from 'src/common/enums';
import { SettingsRepository } from '../repositories/settings.repository';
import {
  UpdatePrivacySettingsDto,
  BlockUserDto,
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
  ConnectLinkedAccountDto,
  DeactivateAccountDto,
  RequestEmailChangeDto,
  RequestPhoneChangeDto,
} from '../dto/account-settings.dto';

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
  ) {}

  //  All settings in one call

  async getAllSettings(userId: string) {
    const settings = await this.repo.getAllSettings(userId);
    const account = await this.repo.getAccount(userId);

    const accountData: Record<string, unknown> =
      typeof account?.toObject === 'function'
        ? (account.toObject() as Record<string, unknown>)
        : ((account as Record<string, unknown> | null) ?? {});

    return {
      ...settings,
      account: accountData,
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
      throw new BadRequestException('Cannot block yourself');
    }
    return this.repo.blockUser(userId, dto.targetUserId);
  }

  async reportUser(userId: string, dto: ReportUserDto) {
    if (userId === dto.targetUserId) {
      throw new BadRequestException('Cannot report yourself');
    }

    return this.userReportModel.findOneAndUpdate(
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
  }

  unblockUser(userId: string, dto: BlockUserDto) {
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

    const [profiles, media] = await Promise.all([
      this.profileModel
        .find({
          userId: { $in: blockedUserIds.map((id) => new Types.ObjectId(id)) },
        })
        .select('userId personal age isVerified')
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
            isVerified?: boolean;
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
    ]);

    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );
    const mediaByUserId = new Map<string, (typeof media)[number]>();
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
            .trim() || 'MatchMate Member';
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
          isVerified: profile?.isVerified === true,
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

  isBlockedBetween(userId: string, targetUserId: string) {
    return this.repo.isBlockedBetween(userId, targetUserId);
  }

  //  Account

  async getAccount(userId: string) {
    const [account, user] = await Promise.all([
      this.repo.getAccount(userId),
      this.userModel.findById(userId).lean().exec(),
    ]);
    const verification = await this.getOrCreateVerification(userId, {
      isEmailVerified: Boolean(user?.isEmailVerified),
      isPhoneVerified: Boolean(user?.isPhoneVerified),
    });
    const isEmailVerified = Boolean(
      verification?.isEmailVerified ?? user?.isEmailVerified,
    );
    const isPhoneVerified = Boolean(
      verification?.isPhoneVerified ?? user?.isPhoneVerified,
    );
    const isProfileVerified = Boolean(verification?.isProfileVerified);

    const accountData: Record<string, unknown> =
      typeof account?.toObject === 'function'
        ? (account.toObject() as Record<string, unknown>)
        : ((account as Record<string, unknown> | null) ?? {});

    return {
      ...accountData,
      emailVerified: isEmailVerified,
      phoneVerified: isPhoneVerified,
      profileVerified: isProfileVerified,
      verification: {
        isVerified: isProfileVerified,
        isProfileVerified,
        isEmailVerified,
        isPhoneVerified,
        verifiedAt: verification?.verifiedAt,
      },
    };
  }

  updateAccount(userId: string, dto: Record<string, unknown>) {
    return this.repo.updateAccount(userId, dto);
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

  async connectLinkedAccount(userId: string, dto: ConnectLinkedAccountDto) {
    const account = await this.repo.getAccount(userId);
    const linkedAccounts = account?.linkedAccounts ?? [];
    const existingIndex = linkedAccounts.findIndex(
      (linked) => linked.provider === dto.provider,
    );
    const nextLinkedAccount = {
      provider: dto.provider,
      providerId: dto.provider,
      connected: true,
      connectedAt: new Date(),
    };

    if (existingIndex >= 0) {
      linkedAccounts[existingIndex] = {
        ...linkedAccounts[existingIndex],
        ...nextLinkedAccount,
      };
    } else {
      linkedAccounts.push(nextLinkedAccount);
    }

    return this.repo.updateAccount(userId, { linkedAccounts });
  }

  async disconnectLinkedAccount(userId: string, provider: string) {
    const account = await this.repo.getAccount(userId);
    const linkedAccounts = (account?.linkedAccounts ?? []).map((linked) =>
      linked.provider === provider
        ? { ...linked, connected: false, connectedAt: undefined }
        : linked,
    );

    return this.repo.updateAccount(userId, { linkedAccounts });
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

    return this.repo.updateNotification(userId, update as never);
  }

  updateNotificationChannel(
    userId: string,
    params: NotificationPreferenceParamsDto,
    dto: UpdateNotificationChannelDto,
  ) {
    return this.repo.updateNotification(userId, {
      [`preferences.${params.event}.${params.channel}`]: dto.value,
    } as never);
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
    return this.repo.updateSecurity(userId, dto);
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
      throw new BadRequestException('Invalid session id');
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
    const sessions = await this.userSessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-refreshToken')
      .lean()
      .exec();

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
    };
  }

  //  Localization

  getLocalization(userId: string) {
    return this.repo.getLocalization(userId);
  }

  updateLocalization(userId: string, dto: UpdateLocalizationSettingsDto) {
    return this.repo.updateLocalization(userId, dto);
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

  private getOrCreateVerification(
    userId: string,
    defaults: {
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
    },
  ) {
    return this.verificationModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
            isEmailVerified: defaults.isEmailVerified,
            isPhoneVerified: defaults.isPhoneVerified,
            isProfileVerified: false,
            isVerified: false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();
  }
}
