import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { ReferralsService } from '../services/referrals.service';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  async getMyReferrals(@Req() req: AuthenticatedRequest) {
    const data = await this.referralsService.getMySummary(req.user.sub);
    return successResponse(data, SuccessCode.REFERRALS_FETCHED);
  }
}
