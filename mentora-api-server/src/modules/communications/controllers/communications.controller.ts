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
import { CreateCommunicationDto } from '../dto/communications.dto';
import { CommunicationsService } from '../services/communications.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_COMMUNICATION_MANAGE)
  async createCommunication(@Body() dto: CreateCommunicationDto) {
    return successResponse(
      await this.service.createCommunication(dto),
      'EDUCATION_PLATFORM_COMMUNICATION_CREATED',
      'CRM communication created',
    );
  }

  @Get()
  @Permissions(Permission.CRM_COMMUNICATION_VIEW)
  async listCommunications(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listCommunications(tenantId),
      'EDUCATION_PLATFORM_COMMUNICATIONS_FETCHED',
      'CRM communications fetched',
    );
  }
}
