import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { ReferralsService } from '../services/referrals.service';
import { RedeemWalletDto } from '../dto/redeem-wallet.dto';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  async getMyReferrals(@Req() req: AuthenticatedRequest) {
    const data = await this.referralsService.getMySummary(req.user.sub);
    return successResponse(data, SuccessCode.REFERRALS_FETCHED);
  }

  @Get('wallet')
  async getWallet(@Req() req: AuthenticatedRequest) {
    const data = await this.referralsService.getWallet(req.user.sub);
    return successResponse(data, SuccessCode.WALLET_FETCHED);
  }

  @Post('wallet/redeem')
  async redeemWallet(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RedeemWalletDto,
  ) {
    const data = await this.referralsService.redeemWallet(
      req.user.sub,
      dto.points,
    );
    return successResponse(data, SuccessCode.WALLET_FETCHED);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    const data = await this.referralsService.getLeaderboard(
      Number(limit) || 25,
    );
    return successResponse(data, SuccessCode.REFERRALS_FETCHED);
  }
}
