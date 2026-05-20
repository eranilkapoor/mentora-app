import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
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

@Injectable()
export class SettingsService {
  constructor(private readonly repo: SettingsRepository) {}

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
