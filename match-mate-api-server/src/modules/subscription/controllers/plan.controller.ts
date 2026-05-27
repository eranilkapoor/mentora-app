import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from '../services/plan.service';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { CreateFeatureDto } from '../dto/create-feature.dto';
import { AssignFeatureDto } from '../dto/assign-feature.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission, Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  //  Static routes MUST come before :id param routes

  // GET /admin/plans
  @Get()
  async getPlans() {
    return successResponse(
      await this.planService.getPlans(),
      SuccessCode.PLANS_FETCHED,
    );
  }

  // GET /admin/plans/full/all
  // Fixed: was after :id  NestJS would match 'full' as the planId
  @Get('full/all')
  async getAllPlansWithFeatures() {
    return successResponse(
      await this.planService.getAllPlansWithFeatures(),
      SuccessCode.PLANS_FETCHED,
    );
  }

  // GET /admin/plans/feature/all
  // Fixed: was after :id  NestJS would match 'feature' as the planId
  @Get('feature/all')
  async getFeatures() {
    return successResponse(
      await this.planService.getFeatures(),
      SuccessCode.FEATURES_FETCHED,
    );
  }

  //  Plan mutations

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.PLAN_CREATE)
  @Post()
  async createPlan(@Body() dto: CreatePlanDto) {
    return successResponse(
      await this.planService.createPlan(dto),
      SuccessCode.PLAN_CREATED,
    );
  }

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.PLAN_UPDATE)
  @Patch(':id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return successResponse(
      await this.planService.updatePlan(id, dto),
      SuccessCode.PLAN_UPDATED,
    );
  }

  //  Feature mutations

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FEATURE_CREATE)
  @Post('feature')
  async createFeature(@Body() dto: CreateFeatureDto) {
    return successResponse(
      await this.planService.createFeature(dto),
      SuccessCode.FEATURE_CREATED,
    );
  }

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FEATURE_UPDATE)
  @Post('feature/assign')
  async assignFeature(@Body() dto: AssignFeatureDto) {
    return successResponse(
      await this.planService.assignFeatureToPlan(dto),
      SuccessCode.FEATURE_ASSIGNED,
    );
  }

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FEATURE_DELETE)
  @Delete(':planId/feature/:featureId')
  async removeFeature(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
  ) {
    return successResponse(
      await this.planService.removeFeatureFromPlan(planId, featureId),
      SuccessCode.FEATURE_REMOVED,
    );
  }

  //  :id param route LAST

  // GET /admin/plans/:id
  // Must be last so 'full', 'feature' don't match here
  @Get(':id')
  async getPlan(@Param('id') id: string) {
    return successResponse(
      await this.planService.getPlanById(id),
      SuccessCode.PLAN_FETCHED,
    );
  }
}
