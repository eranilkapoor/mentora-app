import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { PreferenceService } from '../services/preference.service';
import {
  PartnerFiltersDto,
  MatchSettingsDto,
  MatchWeightsDto,
  UpdateAboutPartnerDto,
} from '../dto/preference.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('preference')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get('me')
  getMyPreference(@Req() req: AuthenticatedRequest) {
    return this.preferenceService.getMyPreference(req.user.sub);
  }

  @Put('filters')
  updateFilters(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PartnerFiltersDto,
  ) {
    return this.preferenceService.updateFilters(req.user.sub, dto);
  }

  @Put('settings')
  updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: MatchSettingsDto,
  ) {
    return this.preferenceService.updateSettings(req.user.sub, dto);
  }

  @Put('weights')
  updateWeights(
    @Req() req: AuthenticatedRequest,
    @Body() dto: MatchWeightsDto,
  ) {
    return this.preferenceService.updateWeights(req.user.sub, dto);
  }

  @Put('about')
  updateAbout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAboutPartnerDto,
  ) {
    return this.preferenceService.updateAboutPartner(
      req.user.sub,
      dto.aboutPartner,
    );
  }
}
