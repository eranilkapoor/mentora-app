import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { PlanService } from '../services/plan.service';
import { SubscriptionService } from '../services/subscription.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(
    private readonly planService: PlanService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('plans')
  getPlans() {
    return this.planService.getActivePlansWithFeatures();
  }

  @Get('current')
  getCurrentSubscription(@Req() req: AuthenticatedRequest) {
    return this.subscriptionService.getActiveSubscription(req.user.sub);
  }
}
