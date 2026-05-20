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
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Permission, Role } from 'src/common/enums';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  // ─── Static routes MUST come before :id param routes ───────────────────────

  // GET /admin/plans
  @Get()
  getPlans() {
    return this.planService.getPlans();
  }

  // GET /admin/plans/full/all
  // Fixed: was after :id — NestJS would match 'full' as the planId
  @Get('full/all')
  getAllPlansWithFeatures() {
    return this.planService.getAllPlansWithFeatures();
  }

  // GET /admin/plans/feature/all
  // Fixed: was after :id — NestJS would match 'feature' as the planId
  @Get('feature/all')
  getFeatures() {
    return this.planService.getFeatures();
  }

  // ─── Plan mutations ────────────────────────────────────────────────────────

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

  // ─── Feature mutations ─────────────────────────────────────────────────────

  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FEATURE_CREATE)
  @Post('feature')
  createFeature(@Body() dto: CreateFeatureDto) {
    return this.planService.createFeature(dto);
  }

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

  // ─── :id param route LAST ──────────────────────────────────────────────────

  // GET /admin/plans/:id
  // Must be last so 'full', 'feature' don't match here
  @Get(':id')
  getPlan(@Param('id') id: string) {
    return this.planService.getPlanById(id);
  }
}
