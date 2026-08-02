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
import { LeadCaptureDto } from '../dto/lead-capture.dto';
import { LeadCaptureService } from '../services/lead-capture.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class LeadCaptureController {
  constructor(private readonly leadsService: LeadCaptureService) {}

  @Public()
  @Post('leads/capture')
  @HttpCode(HttpStatus.CREATED)
  async captureLead(@Body() dto: LeadCaptureDto) {
    return successResponse(
      await this.leadsService.captureLead(dto),
      'EDUCATION_PLATFORM_LEAD_CAPTURED',
      'Lead captured',
    );
  }
}
