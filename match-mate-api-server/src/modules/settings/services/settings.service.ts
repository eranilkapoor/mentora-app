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
import { SettingsRepository } from '../repositories/settings.repository';
import {
  UpdatePrivacySettingsDto,
  BlockUserDto,
} from '../dto/privacy-settings.dto';
import { UpdateNotificationSettingsDto } from '../dto/notification-settings.dto';
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
  ) {}

  // ─── All settings in one call ─────────────────────────────────────────────

  getAllSettings(userId: string) {
    return this.repo.getAllSettings(userId);
  }

  // ─── Privacy ──────────────────────────────────────────────────────────────

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

  unblockUser(userId: string, dto: BlockUserDto) {
    return this.repo.unblockUser(userId, dto.targetUserId);
  }

  async getBlockedUsers(userId: string) {
    const privacy = await this.repo.getPrivacy(userId);
    return { blockedUsers: privacy?.blockedUsers ?? [] };
  }

  // ─── Account ─────────────────────────────────────────────────────────────

  getAccount(userId: string) {
    return this.repo.getAccount(userId);
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

  // ─── Notifications ────────────────────────────────────────────────────────

  getOrCreateUserSettings(userId: string) {
    return this.repo.getOrCreateUserSettings(userId);
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
    if (marketing) update['preferences.marketing'] = marketing;
    if (system) update['preferences.system'] = system;
    if (quietHours) update['quietHours'] = quietHours;

    return this.repo.updateNotification(userId, update as never);
  }

  // ─── Communication ────────────────────────────────────────────────────────

  getCommunication(userId: string) {
    return this.repo.getCommunication(userId);
  }

  updateCommunication(userId: string, dto: UpdateCommunicationSettingsDto) {
    return this.repo.updateCommunication(userId, dto);
  }

  // ─── Security ─────────────────────────────────────────────────────────────

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

  revokeAllDevices(userId: string) {
    return this.repo.revokeAllDevices(userId);
  }

  // ─── Localization ─────────────────────────────────────────────────────────

  getLocalization(userId: string) {
    return this.repo.getLocalization(userId);
  }

  updateLocalization(userId: string, dto: UpdateLocalizationSettingsDto) {
    return this.repo.updateLocalization(userId, dto);
  }

  // ─── Accessibility ────────────────────────────────────────────────────────

  getAccessibility(userId: string) {
    return this.repo.getAccessibility(userId);
  }

  updateAccessibility(userId: string, dto: UpdateAccessibilitySettingsDto) {
    return this.repo.updateAccessibility(userId, dto);
  }

  // ─── Media ────────────────────────────────────────────────────────────────

  getMedia(userId: string) {
    return this.repo.getMedia(userId);
  }

  updateMedia(userId: string, dto: UpdateMediaSettingsDto) {
    return this.repo.updateMedia(userId, dto);
  }

  // ─── AI ───────────────────────────────────────────────────────────────────

  getAi(userId: string) {
    return this.repo.getAi(userId);
  }

  updateAi(userId: string, dto: UpdateAiSettingsDto) {
    return this.repo.updateAi(userId, dto);
  }
}
