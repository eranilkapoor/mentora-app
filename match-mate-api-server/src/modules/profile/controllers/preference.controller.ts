import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PreferenceService } from '../services/preference.service';
import {
  PartnerFiltersDto,
  MatchSettingsDto,
  MatchWeightsDto,
  UpdateAboutPartnerDto,
  UpdatePreferenceDto,
} from '../dto/preference.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { SuccessCode } from 'src/common/constants';

@UseGuards(JwtAuthGuard)
@Controller('preference')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPreference(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePreferenceDto,
  ) {
    const data = await this.preferenceService.createPreference(
      req.user.sub,
      dto,
    );
    return new ApiResponse(
      true,
      SuccessCode.PREFERENCES_FETCHED,
      'Preferences successfully updated',
      data,
    );
  }

  @Get('me')
  async getMyPreference(@Req() req: AuthenticatedRequest) {
    const data = await this.preferenceService.getMyPreference(req.user.sub);
    return new ApiResponse(
      true,
      SuccessCode.PREFERENCES_FETCHED,
      'Preferences successfully fetched',
      data,
    );
  }

  @Put('filters')
  async updateFilters(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PartnerFiltersDto,
  ) {
    const data = await this.preferenceService.updateFilters(req.user.sub, dto);
    return new ApiResponse(
      true,
      SuccessCode.PREFERENCES_FETCHED,
      'Preferences successfully updated',
      data,
    );
  }

  @Put('settings')
  async updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: MatchSettingsDto,
  ) {
    const data = await this.preferenceService.updateSettings(req.user.sub, dto);
    return new ApiResponse(
      true,
      SuccessCode.PREFERENCES_FETCHED,
      'Preferences successfully updated',
      data,
    );
  }

  @Put('weights')
  async updateWeights(
    @Req() req: AuthenticatedRequest,
    @Body() dto: MatchWeightsDto,
  ) {
    const data = await this.preferenceService.updateWeights(req.user.sub, dto);
    return new ApiResponse(
      true,
      SuccessCode.PREFERENCES_FETCHED,
      'Preferences successfully updated',
      data,
    );
  }

  @Put('about')
  async updateAbout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAboutPartnerDto,
  ) {
    const data = await this.preferenceService.updateAboutPartner(
      req.user.sub,
      dto.aboutPartner,
    );
    return new ApiResponse(
      true,
      SuccessCode.PREFERENCES_FETCHED,
      'Preferences successfully updated',
      data,
    );
  }
}
