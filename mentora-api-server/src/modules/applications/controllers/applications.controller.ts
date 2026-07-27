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
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import { CreateApplicationDto } from '../dto/applications.dto';
import { ApplicationsService } from '../services/applications.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_APPLICATION_MANAGE)
  async createApplication(@Body() dto: CreateApplicationDto) {
    return successResponse(
      await this.service.createApplication(dto),
      'EDUCATION_PLATFORM_APPLICATION_CREATED',
      'CRM application created',
    );
  }

  @Get()
  @Permissions(Permission.CRM_APPLICATION_VIEW)
  async listApplications(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listApplications(tenantId),
      'EDUCATION_PLATFORM_APPLICATIONS_FETCHED',
      'CRM applications fetched',
    );
  }
}
