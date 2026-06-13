import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { CurateMatchDto } from '@/modules/matches/dto/curate-match.dto';
import { PremiumMatchCuratorService } from '@/modules/matches/services/premium-match-curator.service';
import { AdminAuditService } from '../services/admin-audit.service';

const CURATOR_ROLES = [Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR];

@Controller('admin/curated-matches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...CURATOR_ROLES)
export class AdminCuratedMatchesController {
  constructor(
    private readonly curatorService: PremiumMatchCuratorService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  async listCuratedMatches(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ) {
    return successResponse(
      await this.curatorService.getAdminCuratedMatches(
        userId,
        limit ? Number(limit) : undefined,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Post()
  async curateMatch(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CurateMatchDto,
  ) {
    const data = await this.curatorService.curateMatch(req.user.sub, dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'curated_match.assigned',
      resource: 'curated_match',
      targetId: dto.userId,
      reason: dto.note,
      after: data ? (data as unknown as Record<string, unknown>) : undefined,
    });
    return successResponse(data, SuccessCode.MATCHES_FETCHED);
  }

  @Delete(':curatedMatchId')
  async expireCuratedMatch(
    @Req() req: AuthenticatedRequest,
    @Param('curatedMatchId') curatedMatchId: string,
  ) {
    const data = await this.curatorService.expireCuratedMatch(curatedMatchId);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'curated_match.expired',
      resource: 'curated_match',
      targetId: curatedMatchId,
      after: data ? (data as unknown as Record<string, unknown>) : undefined,
    });
    return successResponse(data, SuccessCode.MATCH_REMOVED);
  }
}
