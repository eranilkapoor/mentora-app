import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FailPaymentDto } from '../dto/fail-payment.dto';
import { ListPaymentsDto } from '../dto/list-payments.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { VerifyStoreSubscriptionDto } from '../dto/verify-store-subscription.dto';
import { Public } from '@/common/decorators/public.decorator';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { GooglePlayRtdnEnvelopeDto } from '../dto/google-play-rtdn-envelope.dto';
import { GooglePlayRtdnService } from '../services/google-play-rtdn.service';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipRateLimit } from '@/common/decorators/skip-rate-limit.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly googlePlayRtdnService: GooglePlayRtdnService,
  ) {}

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Post('google-play/rtdn')
  @HttpCode(204)
  async googlePlayRtdn(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: GooglePlayRtdnEnvelopeDto,
  ): Promise<void> {
    await this.googlePlayRtdnService.process(authorization, dto);
  }

  @Post('order')
  async createOrder(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrderDto,
  ) {
    return successResponse(
      await this.paymentsService.createOrder(req.user.sub, dto),
      SuccessCode.PAYMENT_CREATED,
    );
  }

  @Post('verify')
  async verify(
    @Req() req: AuthenticatedRequest,
    @Body() dto: VerifyPaymentDto,
  ) {
    return successResponse(
      await this.paymentsService.verifyPayment(req.user.sub, dto),
      SuccessCode.PAYMENT_VERIFIED,
    );
  }

  @Post('store/verify-subscription')
  async verifyStoreSubscription(
    @Req() req: AuthenticatedRequest,
    @Body() dto: VerifyStoreSubscriptionDto,
  ) {
    return successResponse(
      await this.paymentsService.verifyStoreSubscription(req.user.sub, dto),
      SuccessCode.PAYMENT_VERIFIED,
    );
  }

  @Post('coupons/validate')
  async validateCoupon(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ValidateCouponDto,
  ) {
    return successResponse(
      await this.paymentsService.validateCoupon(req.user.sub, dto),
      SuccessCode.COUPON_VALIDATED,
    );
  }

  @Post('fail')
  async markFailed(
    @Req() req: AuthenticatedRequest,
    @Body() dto: FailPaymentDto,
  ) {
    return successResponse(
      await this.paymentsService.markPaymentFailed(req.user.sub, dto),
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
      await this.paymentsService.processWebhook(dto, signature),
      SuccessCode.PAYMENT_WEBHOOK_PROCESSED,
    );
  }

  @Get('my-payments')
  async getMyPayments(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListPaymentsDto,
  ) {
    return successResponse(
      await this.paymentsService.getUserPayments(req.user.sub, query),
      SuccessCode.PAYMENTS_FETCHED,
    );
  }

  @Get(':orderId')
  async getPaymentByOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return successResponse(
      await this.paymentsService.getUserPaymentDetail(req.user.sub, orderId),
      SuccessCode.PAYMENT_FETCHED,
    );
  }

  @Get(':orderId/invoice')
  async getInvoice(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return successResponse(
      await this.paymentsService.getInvoice(req.user.sub, orderId),
      SuccessCode.PAYMENT_INVOICE_FETCHED,
    );
  }

  @Get(':orderId/invoice/pdf')
  async getInvoicePdf(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return successResponse(
      await this.paymentsService.getInvoicePdf(req.user.sub, orderId),
      SuccessCode.PAYMENT_INVOICE_FETCHED,
    );
  }
}
