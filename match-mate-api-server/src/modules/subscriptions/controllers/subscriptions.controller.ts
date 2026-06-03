import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { PlanService } from '../services/plan.service';
import { SubscriptionsService } from '../services/subscriptions.service';
import { ProfileBoostService } from '../services/profile-boost.service';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { StartFreeTrialDto } from '../dto/start-free-trial.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly planService: PlanService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly profileBoostService: ProfileBoostService,
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

  @Post('trial')
  async startFreeTrial(
    @Req() req: AuthenticatedRequest,
    @Body() dto: StartFreeTrialDto,
  ) {
    return successResponse(
      await this.subscriptionsService.startFreeTrial(
        req.user.sub,
        dto.planId,
        dto.trialDays,
      ),
      SuccessCode.SUBSCRIPTION_CREATED,
    );
  }

  @Get('boosts')
  async getMyBoosts(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.profileBoostService.getMyBoosts(req.user.sub),
      SuccessCode.SUBSCRIPTION_BILLING_FETCHED,
    );
  }
}
