import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from '../dto/applications.dto';
import { ApplicationsService } from '../services/applications.service';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Body() dto: CreateApplicationDto) {
    return successResponse(
      await this.service.createApplication(dto),
      'EDUCATION_PLATFORM_APPLICATION_CREATED',
      'CRM application created',
    );
  }

  @Get()
  async listApplications(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listApplications(tenantId),
      'EDUCATION_PLATFORM_APPLICATIONS_FETCHED',
      'CRM applications fetched',
    );
  }
}
