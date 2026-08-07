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
import { CreateProgramDto, UpdateProgramDto } from '../dto/programs.dto';
import { ProgramsService } from '../services/programs.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/programs')
export class ProgramsController {
  constructor(private readonly service: ProgramsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.PROGRAM_MANAGE)
  async createProgram(@Body() dto: CreateProgramDto) {
    return successResponse(
      await this.service.createProgram(dto),
      'EDUCATION_PLATFORM_PROGRAM_CREATED',
      'Program created',
    );
  }

  @Get()
  @Permissions(Permission.PROGRAM_VIEW)
  async listPrograms(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listPrograms({
        level,
        limit,
        page,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'EDUCATION_PLATFORM_PROGRAMS_FETCHED',
      'Programs fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.PROGRAM_VIEW)
  async exportPrograms(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportPrograms(organizationId),
      'EDUCATION_PLATFORM_PROGRAMS_EXPORTED',
      'Programs exported',
    );
  }

  @Put(':programId')
  @Permissions(Permission.PROGRAM_MANAGE)
  async updateProgram(
    @Param('programId') programId: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return successResponse(
      await this.service.updateProgram(programId, dto),
      'EDUCATION_PLATFORM_PROGRAM_UPDATED',
      'Program updated',
    );
  }

  @Delete(':programId')
  @Permissions(Permission.PROGRAM_MANAGE)
  async archiveProgram(
    @Param('programId') programId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveProgram(programId, organizationId),
      'EDUCATION_PLATFORM_PROGRAM_ARCHIVED',
      'Program archived',
    );
  }

  @Post(':programId/restore')
  @Permissions(Permission.PROGRAM_MANAGE)
  async restoreProgram(
    @Param('programId') programId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restoreProgram(programId, organizationId),
      'EDUCATION_PLATFORM_PROGRAM_RESTORED',
      'Program restored',
    );
  }
}
