import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FailPaymentDto } from '../dto/fail-payment.dto';
import { ListPaymentsDto } from '../dto/list-payments.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('order')
  async createOrder(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrderDto,
  ) {
    return successResponse(
      await this.service.createOrder(req.user.sub, dto),
      SuccessCode.PAYMENT_CREATED,
    );
  }

  @Post('verify')
  async verify(
    @Req() req: AuthenticatedRequest,
    @Body() dto: VerifyPaymentDto,
  ) {
    return successResponse(
      await this.service.verifyPayment(req.user.sub, dto),
      SuccessCode.PAYMENT_VERIFIED,
    );
  }

  @Post('fail')
  async markFailed(
    @Req() req: AuthenticatedRequest,
    @Body() dto: FailPaymentDto,
  ) {
    return successResponse(
      await this.service.markPaymentFailed(req.user.sub, dto),
      SuccessCode.PAYMENT_FAILED_RECORDED,
    );
  }

  @Public()
  @Post('webhook')
  async webhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-payment-signature') signature?: string,
  ) {
    return successResponse(
      await this.service.processWebhook(dto, signature),
      SuccessCode.PAYMENT_WEBHOOK_PROCESSED,
    );
  }

  @Get('my-payments')
  async getMyPayments(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListPaymentsDto,
  ) {
    return successResponse(
      await this.service.getUserPayments(req.user.sub, query),
      SuccessCode.PAYMENTS_FETCHED,
    );
  }

  @Get(':orderId')
  async getPaymentByOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return successResponse(
      await this.service.getUserPaymentDetail(req.user.sub, orderId),
      SuccessCode.PAYMENT_FETCHED,
    );
  }
}
