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

import { PlanService } from './services/plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { AssignFeatureDto } from './dto/assign-feature.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Permission, Role } from 'src/common/enums';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  // ================= PLAN =================

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.PLAN_CREATE)
  @Post()
  createPlan(@Body() dto: CreatePlanDto) {
    return this.planService.createPlan(dto);
  }

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.PLAN_UPDATE)
  @Patch(':id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.planService.updatePlan(id, dto);
  }

  @Get()
  getPlans() {
    return this.planService.getPlans();
  }

  @Get(':id')
  getPlan(@Param('id') id: string) {
    return this.planService.getPlanById(id);
  }

  @Get('full/all')
  getAllPlansWithFeatures() {
    return this.planService.getAllPlansWithFeatures();
  }

  // ================= FEATURE =================

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FEATURE_CREATE)
  @Post('feature')
  createFeature(@Body() dto: CreateFeatureDto) {
    return this.planService.createFeature(dto);
  }

  @Get('feature/all')
  getFeatures() {
    return this.planService.getFeatures();
  }

  // ================= ASSIGN =================

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FEATURE_UPDATE)
  @Post('feature/assign')
  assignFeature(@Body() dto: AssignFeatureDto) {
    return this.planService.assignFeatureToPlan(dto);
  }

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FEATURE_DELETE)
  @Delete(':planId/feature/:featureId')
  removeFeature(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
  ) {
    return this.planService.removeFeatureFromPlan(planId, featureId);
  }
}
