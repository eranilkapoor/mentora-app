import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { PlanService } from '../services/plan.service';
import { SubscriptionService } from '../services/subscription.service';
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(
    private readonly planService: PlanService,
    private readonly subscriptionService: SubscriptionService,
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
      await this.subscriptionService.getActiveSubscription(req.user.sub),
      SuccessCode.SUBSCRIPTION_ACTIVATED,
    );
  }
}
