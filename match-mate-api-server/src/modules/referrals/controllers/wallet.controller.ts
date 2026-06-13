import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { WalletService } from '../services/wallet.service';
import { SpendWalletDto } from '../dto/spend-wallet.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.walletService.getSummary(req.user.sub),
      SuccessCode.WALLET_FETCHED,
    );
  }

  @Post('spend')
  async spendWallet(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SpendWalletDto,
  ) {
    return successResponse(
      await this.walletService.spend({
        userId: req.user.sub,
        coins: dto.coins,
        referenceId: dto.referenceId,
        reason: dto.reason,
        metadata: dto.metadata,
      }),
      SuccessCode.WALLET_FETCHED,
    );
  }
}
