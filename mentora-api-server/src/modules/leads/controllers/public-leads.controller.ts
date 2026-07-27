import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PublicLeadCaptureDto } from '../dto/public-leads.dto';
import { PublicLeadsService } from '../services/public-leads.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class PublicLeadsController {
  constructor(private readonly leadsService: PublicLeadsService) {}

  @Public()
  @Post('leads/public')
  @HttpCode(HttpStatus.CREATED)
  async capturePublicLead(@Body() dto: PublicLeadCaptureDto) {
    return successResponse(
      await this.leadsService.capturePublicLead(dto),
      'EDUCATION_PLATFORM_PUBLIC_LEAD_CAPTURED',
      'Public lead captured',
    );
  }
}
