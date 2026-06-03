import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission, Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { PlanService } from '@/modules/subscriptions/services/plan.service';
import { CreatePlanDto } from '@/modules/subscriptions/dto/create-plan.dto';
import { UpdatePlanDto } from '@/modules/subscriptions/dto/update-plan.dto';
import { CreateFeatureDto } from '@/modules/subscriptions/dto/create-feature.dto';
import { AssignFeatureDto } from '@/modules/subscriptions/dto/assign-feature.dto';
import { AdminAuditService } from '../services/admin-audit.service';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class AdminPlansController {
  constructor(
    private readonly planService: PlanService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Permissions(Permission.PLAN_VIEW)
  @Get()
  async getPlans() {
    return successResponse(
      await this.planService.getPlans(),
      SuccessCode.PLANS_FETCHED,
    );
  }

  @Permissions(Permission.PLAN_VIEW)
  @Get('full/all')
  async getAllPlansWithFeatures() {
    return successResponse(
      await this.planService.getAllPlansWithFeatures(),
      SuccessCode.PLANS_FETCHED,
    );
  }

  @Permissions(Permission.PLAN_VIEW)
  @Get('feature/all')
  async getFeatures() {
    return successResponse(
      await this.planService.getFeatures(),
      SuccessCode.FEATURES_FETCHED,
    );
  }

  @Permissions(Permission.PLAN_CREATE)
  @Post()
  async createPlan(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePlanDto,
  ) {
    const data = await this.planService.createPlan(dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'plan.created',
      resource: 'plan',
      targetId: data?._id?.toString(),
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.PLAN_CREATED);
  }

  @Permissions(Permission.PLAN_UPDATE)
  @Patch(':id')
  async updatePlan(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    const data = await this.planService.updatePlan(id, dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'plan.updated',
      resource: 'plan',
      targetId: id,
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.PLAN_UPDATED);
  }

  @Permissions(Permission.FEATURE_CREATE)
  @Post('feature')
  async createFeature(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateFeatureDto,
  ) {
    const data = await this.planService.createFeature(dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'feature.created',
      resource: 'feature',
      targetId: data?._id?.toString(),
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.FEATURE_CREATED);
  }

  @Permissions(Permission.FEATURE_UPDATE)
  @Post('feature/assign')
  async assignFeature(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AssignFeatureDto,
  ) {
    const data = await this.planService.assignFeatureToPlan(dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'feature.assigned_to_plan',
      resource: 'plan_feature',
      targetId: dto.planId,
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.FEATURE_ASSIGNED);
  }

  @Permissions(Permission.FEATURE_DELETE)
  @Delete(':planId/feature/:featureId')
  async removeFeature(
    @Req() req: AuthenticatedRequest,
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
  ) {
    const data = await this.planService.removeFeatureFromPlan(
      planId,
      featureId,
    );
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'feature.removed_from_plan',
      resource: 'plan_feature',
      targetId: planId,
      metadata: { featureId },
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.FEATURE_REMOVED);
  }

  @Permissions(Permission.PLAN_VIEW)
  @Get(':id')
  async getPlan(@Param('id') id: string) {
    return successResponse(
      await this.planService.getPlanById(id),
      SuccessCode.PLAN_FETCHED,
    );
  }
}
