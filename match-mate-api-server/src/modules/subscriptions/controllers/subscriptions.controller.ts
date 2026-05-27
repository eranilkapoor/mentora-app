import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { PlanService } from '../services/plan.service';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly planService: PlanService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('plans')
  async getPlans() {
    return successResponse(
      await this.planService.getActivePlansWithFeatures(),
      SuccessCode.PLANS_FETCHED,
    );
  }

  @Get('current')
  async getCurrentSubscription(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.subscriptionsService.getActiveSubscription(req.user.sub),
      SuccessCode.SUBSCRIPTION_ACTIVATED,
    );
  }

  @Get('billing')
  async getBillingSummary(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.subscriptionsService.getBillingSummary(req.user.sub),
      SuccessCode.SUBSCRIPTION_BILLING_FETCHED,
    );
  }
}
