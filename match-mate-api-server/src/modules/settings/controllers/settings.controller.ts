import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { SettingsService } from '../services/settings.service';
import {
  UpdatePrivacySettingsDto,
  BlockUserDto,
} from '../dto/privacy-settings.dto';
import { UpdateNotificationSettingsDto } from '../dto/notification-settings.dto';
import { UpdateCommunicationSettingsDto } from '../dto/communication-settings.dto';
import {
  UpdateSecuritySettingsDto,
  SetAppPinDto,
} from '../dto/security-settings.dto';
import { UpdateLocalizationSettingsDto } from '../dto/localization-settings.dto';
import { UpdateAccessibilitySettingsDto } from '../dto/accessibility-settings.dto';
import { UpdateMediaSettingsDto } from '../dto/media-settings.dto';
import { UpdateAiSettingsDto } from '../dto/ai-settings.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import {
  ConnectLinkedAccountDto,
  DeactivateAccountDto,
  RequestEmailChangeDto,
  RequestPhoneChangeDto,
} from '../dto/account-settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ─── All settings ─────────────────────────────────────────────────────────

  @Get()
  getAllSettings(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getAllSettings(req.user.sub);
  }

  // ─── Privacy ──────────────────────────────────────────────────────────────

  @Get('privacy')
  getPrivacy(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getPrivacy(req.user.sub);
  }

  @Put('privacy')
  updatePrivacy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePrivacySettingsDto,
  ) {
    return this.settingsService.updatePrivacy(req.user.sub, dto);
  }

  @Get('privacy/blocked')
  getBlockedUsers(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getBlockedUsers(req.user.sub);
  }

  @Post('privacy/block')
  @HttpCode(HttpStatus.OK)
  blockUser(@Req() req: AuthenticatedRequest, @Body() dto: BlockUserDto) {
    return this.settingsService.blockUser(req.user.sub, dto);
  }

  @Post('privacy/unblock')
  @HttpCode(HttpStatus.OK)
  unblockUser(@Req() req: AuthenticatedRequest, @Body() dto: BlockUserDto) {
    return this.settingsService.unblockUser(req.user.sub, dto);
  }

  // ─── Account ─────────────────────────────────────────────────────────────

  @Get('account')
  getAccount(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getAccount(req.user.sub);
  }

  @Put('account')
  updateAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.settingsService.updateAccount(req.user.sub, dto);
  }

  @Post('account/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DeactivateAccountDto,
  ) {
    return this.settingsService.deactivateAccount(req.user.sub, dto);
  }

  @Post('account/delete')
  @HttpCode(HttpStatus.OK)
  scheduleAccountDeletion(@Req() req: AuthenticatedRequest) {
    return this.settingsService.scheduleAccountDeletion(req.user.sub);
  }

  @Post('account/linked/:provider')
  @HttpCode(HttpStatus.OK)
  connectLinkedAccount(
    @Req() req: AuthenticatedRequest,
    @Param() dto: ConnectLinkedAccountDto,
  ) {
    return this.settingsService.connectLinkedAccount(req.user.sub, dto);
  }

  @Delete('account/linked/:provider')
  @HttpCode(HttpStatus.OK)
  disconnectLinkedAccount(
    @Req() req: AuthenticatedRequest,
    @Param('provider') provider: string,
  ) {
    return this.settingsService.disconnectLinkedAccount(req.user.sub, provider);
  }

  @Post('account/email')
  @HttpCode(HttpStatus.ACCEPTED)
  requestEmailChange(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestEmailChangeDto,
  ) {
    return this.settingsService.requestEmailChange(req.user.sub, dto);
  }

  @Post('account/phone')
  @HttpCode(HttpStatus.ACCEPTED)
  requestPhoneChange(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestPhoneChangeDto,
  ) {
    return this.settingsService.requestPhoneChange(req.user.sub, dto);
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  @Get('notifications')
  getNotification(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getNotification(req.user.sub);
  }

  @Put('notifications')
  updateNotification(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.settingsService.updateNotification(req.user.sub, dto);
  }

  // ─── Communication ────────────────────────────────────────────────────────

  @Get('communication')
  getCommunication(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getCommunication(req.user.sub);
  }

  @Put('communication')
  updateCommunication(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateCommunicationSettingsDto,
  ) {
    return this.settingsService.updateCommunication(req.user.sub, dto);
  }

  // ─── Security ─────────────────────────────────────────────────────────────

  @Get('security')
  getSecurity(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getSecurity(req.user.sub);
  }

  @Put('security')
  updateSecurity(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateSecuritySettingsDto,
  ) {
    return this.settingsService.updateSecurity(req.user.sub, dto);
  }

  @Post('security/pin')
  @HttpCode(HttpStatus.OK)
  setAppPin(@Req() req: AuthenticatedRequest, @Body() dto: SetAppPinDto) {
    return this.settingsService.setAppPin(req.user.sub, dto);
  }

  @Delete('security/pin')
  @HttpCode(HttpStatus.OK)
  disableAppPin(@Req() req: AuthenticatedRequest) {
    return this.settingsService.disableAppPin(req.user.sub);
  }

  @Delete('security/devices/:deviceId')
  @HttpCode(HttpStatus.OK)
  revokeDevice(
    @Req() req: AuthenticatedRequest,
    @Param('deviceId') deviceId: string,
  ) {
    return this.settingsService.revokeDevice(req.user.sub, { deviceId });
  }

  @Delete('security/devices')
  @HttpCode(HttpStatus.OK)
  revokeAllDevices(@Req() req: AuthenticatedRequest) {
    return this.settingsService.revokeAllDevices(req.user.sub);
  }

  // ─── Localization ─────────────────────────────────────────────────────────

  @Get('localization')
  getLocalization(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getLocalization(req.user.sub);
  }

  @Put('localization')
  updateLocalization(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateLocalizationSettingsDto,
  ) {
    return this.settingsService.updateLocalization(req.user.sub, dto);
  }

  // ─── Accessibility ────────────────────────────────────────────────────────

  @Get('accessibility')
  getAccessibility(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getAccessibility(req.user.sub);
  }

  @Put('accessibility')
  updateAccessibility(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAccessibilitySettingsDto,
  ) {
    return this.settingsService.updateAccessibility(req.user.sub, dto);
  }

  // ─── Media ────────────────────────────────────────────────────────────────

  @Get('media')
  getMedia(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getMedia(req.user.sub);
  }

  @Put('media')
  updateMedia(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMediaSettingsDto,
  ) {
    return this.settingsService.updateMedia(req.user.sub, dto);
  }

  // ─── AI ───────────────────────────────────────────────────────────────────

  @Get('ai')
  getAi(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getAi(req.user.sub);
  }

  @Put('ai')
  updateAi(@Req() req: AuthenticatedRequest, @Body() dto: UpdateAiSettingsDto) {
    return this.settingsService.updateAi(req.user.sub, dto);
  }
}
