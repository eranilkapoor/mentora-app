import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateCommunicationDto,
  UpdateCommunicationDto,
} from '../dto/communications.dto';
import { CommunicationsService } from '../services/communications.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/communications')
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async createCommunication(@Body() dto: CreateCommunicationDto) {
    return successResponse(
      await this.service.createCommunication(dto),
      'EDUCATION_PLATFORM_COMMUNICATION_CREATED',
      'Communication created',
    );
  }

  @Get()
  @Permissions(Permission.COMMUNICATION_VIEW)
  async listCommunications(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('direction') direction?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listCommunications({
        channel,
        direction,
        entityId,
        entityType,
        limit,
        page,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'EDUCATION_PLATFORM_COMMUNICATIONS_FETCHED',
      'Communications fetched',
    );
  }

  @Put(':communicationId')
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async updateCommunication(
    @Param('communicationId') communicationId: string,
    @Body() dto: UpdateCommunicationDto,
  ) {
    return successResponse(
      await this.service.updateCommunication(communicationId, dto),
      'EDUCATION_PLATFORM_COMMUNICATION_UPDATED',
      'Communication updated',
    );
  }

  @Delete(':communicationId')
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async archiveCommunication(
    @Param('communicationId') communicationId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveCommunication(communicationId, organizationId),
      'EDUCATION_PLATFORM_COMMUNICATION_ARCHIVED',
      'Communication archived',
    );
  }
}
