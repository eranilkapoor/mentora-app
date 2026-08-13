import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateReportCardDto,
  GenerateReportCardDto,
  UpdateReportCardDto,
} from '../dto/report-card.dto';
import { ReportCardsService } from '../services/report-cards.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/report-cards')
export class ReportCardsController {
  constructor(private readonly service: ReportCardsService) {}

  @Post()
  @Permissions(Permission.ACADEMIC_RECORD_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReportCardDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'REPORT_CARD_CREATED',
      'Report card created',
    );
  }

  @Post('generate')
  @Permissions(Permission.ACADEMIC_RECORD_MANAGE)
  async generate(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GenerateReportCardDto,
  ) {
    return successResponse(
      await this.service.generate(req.user.sub, dto),
      'REPORT_CARD_GENERATED',
      'Report card generated from exam results and attendance',
    );
  }

  @Get()
  @Permissions(Permission.ACADEMIC_RECORD_VIEW)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('studentId') studentId?: string,
    @Query('gradeId') gradeId?: string,
    @Query('term') term?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return successResponse(
      await this.service.list(
        {
          organizationId,
          studentId,
          gradeId,
          term,
          status,
          page,
          limit,
        },
        req.user.sub,
      ),
      'REPORT_CARDS_FETCHED',
      'Report cards fetched',
    );
  }

  @Get(':reportCardId')
  @Permissions(Permission.ACADEMIC_RECORD_VIEW)
  async getById(
    @Req() req: AuthenticatedRequest,
    @Param('reportCardId') reportCardId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(reportCardId, organizationId, req.user.sub),
      'REPORT_CARD_FETCHED',
      'Report card fetched',
    );
  }

  @Put(':reportCardId')
  @Permissions(Permission.ACADEMIC_RECORD_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('reportCardId') reportCardId: string,
    @Body() dto: UpdateReportCardDto,
  ) {
    return successResponse(
      await this.service.update(reportCardId, dto, req.user.sub),
      'REPORT_CARD_UPDATED',
      'Report card updated',
    );
  }
}
