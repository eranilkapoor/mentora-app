import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { SettingsService } from '../services/settings.service';
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
} from '../dto/security-settings.dto';
import { UpdateLocalizationSettingsDto } from '../dto/localization-settings.dto';
import { UpdateAccessibilitySettingsDto } from '../dto/accessibility-settings.dto';
import { UpdateMediaSettingsDto } from '../dto/media-settings.dto';
import { UpdateAiSettingsDto } from '../dto/ai-settings.dto';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import {
  DeactivateAccountDto,
  RequestEmailChangeDto,
  RequestPhoneChangeDto,
} from '../dto/account-settings.dto';
import { RecordConsentDto } from '../dto/consent.dto';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { DataExportService } from '../services/data-export.service';
import { ConsentService } from '../services/consent.service';
import { SocialLoginDto } from '@/modules/auth/dto/auth.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly dataExportService: DataExportService,
    private readonly consentService: ConsentService,
  ) {}

  private async respond<T>(result: T | Promise<T>, code: SuccessCode) {
    return successResponse(await Promise.resolve(result), code);
  }

  //  All settings

  @Get()
  getAllSettings(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getAllSettings(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  //  Privacy

  @Get('privacy')
  getPrivacy(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getPrivacy(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('privacy')
  updatePrivacy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePrivacySettingsDto,
  ) {
    return this.respond(
      this.settingsService.updatePrivacy(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Get('privacy/blocked')
  getBlockedUsers(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getBlockedUsers(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Post('privacy/block')
  @HttpCode(HttpStatus.OK)
  blockUser(@Req() req: AuthenticatedRequest, @Body() dto: BlockUserDto) {
    return this.respond(
      this.settingsService.blockUser(req.user.sub, dto),
      SuccessCode.USER_BLOCKED,
    );
  }

  @Post('privacy/unblock')
  @HttpCode(HttpStatus.OK)
  unblockUser(@Req() req: AuthenticatedRequest, @Body() dto: BlockUserDto) {
    return this.respond(
      this.settingsService.unblockUser(req.user.sub, dto),
      SuccessCode.USER_UNBLOCKED,
    );
  }

  @Post('privacy/report')
  @HttpCode(HttpStatus.OK)
  reportUser(@Req() req: AuthenticatedRequest, @Body() dto: ReportUserDto) {
    return this.respond(
      this.settingsService.reportUser(req.user.sub, dto),
      SuccessCode.USER_REPORTED,
    );
  }

  @Get('privacy/hidden')
  getHiddenProfiles(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getHiddenProfiles(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Post('privacy/hide')
  @HttpCode(HttpStatus.OK)
  hideProfile(@Req() req: AuthenticatedRequest, @Body() dto: HideProfileDto) {
    return this.respond(
      this.settingsService.hideProfile(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Post('privacy/unhide')
  @HttpCode(HttpStatus.OK)
  unhideProfile(@Req() req: AuthenticatedRequest, @Body() dto: BlockUserDto) {
    return this.respond(
      this.settingsService.unhideProfile(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  //  Account

  @Get('account')
  getAccount(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getAccount(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Post('account/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DeactivateAccountDto,
  ) {
    return this.respond(
      this.settingsService.deactivateAccount(req.user.sub, dto),
      SuccessCode.SETTINGS_ACCOUNT_DEACTIVATED,
    );
  }

  @Post('account/delete')
  @HttpCode(HttpStatus.OK)
  scheduleAccountDeletion(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.scheduleAccountDeletion(req.user.sub),
      SuccessCode.SETTINGS_ACCOUNT_DELETION_SCHEDULED,
    );
  }

  @Delete('account/linked/:provider')
  @HttpCode(HttpStatus.OK)
  disconnectLinkedAccount(
    @Req() req: AuthenticatedRequest,
    @Param('provider') provider: string,
  ) {
    return this.respond(
      this.settingsService.disconnectLinkedAccount(req.user.sub, provider),
      SuccessCode.SETTINGS_ACCOUNT_UNLINKED,
    );
  }

  @Post('account/linked/social')
  @HttpCode(HttpStatus.OK)
  connectSocialLinkedAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SocialLoginDto,
  ) {
    return this.respond(
      this.settingsService.connectSocialLinkedAccount(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Put('account/linked/:provider/primary')
  setPrimaryLinkedAccount(
    @Req() req: AuthenticatedRequest,
    @Param('provider') provider: string,
  ) {
    return this.respond(
      this.settingsService.setPrimaryLinkedAccount(req.user.sub, provider),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Post('account/email')
  @HttpCode(HttpStatus.ACCEPTED)
  requestEmailChange(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestEmailChangeDto,
  ) {
    return this.respond(
      this.settingsService.requestEmailChange(req.user.sub, dto),
      SuccessCode.SETTINGS_ACCOUNT_CHANGE_REQUESTED,
    );
  }

  @Post('account/phone')
  @HttpCode(HttpStatus.ACCEPTED)
  requestPhoneChange(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestPhoneChangeDto,
  ) {
    return this.respond(
      this.settingsService.requestPhoneChange(req.user.sub, dto),
      SuccessCode.SETTINGS_ACCOUNT_CHANGE_REQUESTED,
    );
  }

  @Get('account/data-export')
  downloadDataExport(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.dataExportService.exportUserData(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Get('account/consents')
  getConsents(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.consentService.getConsents(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Post('account/consents')
  @HttpCode(HttpStatus.OK)
  recordConsent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RecordConsentDto,
  ) {
    const rawUserAgent = req.headers['user-agent'];
    const userAgent =
      typeof rawUserAgent === 'string' ? rawUserAgent : rawUserAgent?.[0];

    return this.respond(
      this.consentService.recordConsent(req.user.sub, dto, {
        ip: req.ip,
        userAgent,
      }),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  //  Notifications

  @Get('notifications')
  getNotification(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getNotification(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('notifications')
  updateNotification(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.respond(
      this.settingsService.updateNotification(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Patch('notifications/preferences/:event/:channel')
  updateNotificationChannel(
    @Req() req: AuthenticatedRequest,
    @Param() params: NotificationPreferenceParamsDto,
    @Body() dto: UpdateNotificationChannelDto,
  ) {
    return this.respond(
      this.settingsService.updateNotificationChannel(req.user.sub, params, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  //  Communication

  @Get('communication')
  getCommunication(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getCommunication(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('communication')
  updateCommunication(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateCommunicationSettingsDto,
  ) {
    return this.respond(
      this.settingsService.updateCommunication(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  //  Security

  @Get('security')
  getSecurity(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getSecurity(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('security')
  updateSecurity(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateSecuritySettingsDto,
  ) {
    return this.respond(
      this.settingsService.updateSecurity(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Post('security/pin')
  @HttpCode(HttpStatus.OK)
  setAppPin(@Req() req: AuthenticatedRequest, @Body() dto: SetAppPinDto) {
    return this.respond(
      this.settingsService.setAppPin(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Delete('security/pin')
  @HttpCode(HttpStatus.OK)
  disableAppPin(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.disableAppPin(req.user.sub),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  @Delete('security/devices/:deviceId')
  @HttpCode(HttpStatus.OK)
  revokeDevice(
    @Req() req: AuthenticatedRequest,
    @Param('deviceId') deviceId: string,
  ) {
    return this.respond(
      this.settingsService.revokeDevice(req.user.sub, { deviceId }),
      SuccessCode.SETTINGS_DEVICE_REVOKED,
    );
  }

  @Delete('security/devices')
  @HttpCode(HttpStatus.OK)
  revokeAllDevices(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.revokeAllDevices(req.user.sub),
      SuccessCode.SETTINGS_DEVICE_REVOKED,
    );
  }

  @Get('security/login-history')
  getLoginHistory(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getLoginHistory(req.user.sub),
      SuccessCode.SETTINGS_LOGIN_HISTORY_FETCHED,
    );
  }

  @Delete('security/sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  revokeSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    return this.respond(
      this.settingsService.revokeSession(req.user.sub, sessionId),
      SuccessCode.SETTINGS_DEVICE_REVOKED,
    );
  }

  //  Localization

  @Get('localization')
  getLocalization(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getLocalization(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('localization')
  updateLocalization(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateLocalizationSettingsDto,
  ) {
    return this.respond(
      this.settingsService.updateLocalization(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  //  Accessibility

  @Get('accessibility')
  getAccessibility(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getAccessibility(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('accessibility')
  updateAccessibility(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAccessibilitySettingsDto,
  ) {
    return this.respond(
      this.settingsService.updateAccessibility(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  //  Media

  @Get('media')
  getMedia(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getMedia(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('media')
  updateMedia(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMediaSettingsDto,
  ) {
    return this.respond(
      this.settingsService.updateMedia(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }

  //  AI

  @Get('ai')
  getAi(@Req() req: AuthenticatedRequest) {
    return this.respond(
      this.settingsService.getAi(req.user.sub),
      SuccessCode.SETTINGS_FETCHED,
    );
  }

  @Put('ai')
  updateAi(@Req() req: AuthenticatedRequest, @Body() dto: UpdateAiSettingsDto) {
    return this.respond(
      this.settingsService.updateAi(req.user.sub, dto),
      SuccessCode.SETTINGS_UPDATED,
    );
  }
}
