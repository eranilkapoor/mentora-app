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

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('order')
  createOrder(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.service.createOrder(req.user.sub, dto);
  }

  @Post('verify')
  verify(@Req() req: AuthenticatedRequest, @Body() dto: VerifyPaymentDto) {
    return this.service.verifyPayment(req.user.sub, dto);
  }

  @Post('fail')
  markFailed(@Req() req: AuthenticatedRequest, @Body() dto: FailPaymentDto) {
    return this.service.markPaymentFailed(req.user.sub, dto);
  }

  @Public()
  @Post('webhook')
  webhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-payment-signature') signature?: string,
  ) {
    return this.service.processWebhook(dto, signature);
  }

  @Get('my-payments')
  getMyPayments(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListPaymentsDto,
  ) {
    return this.service.getUserPayments(req.user.sub, query);
  }

  @Get(':orderId')
  getPaymentByOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return this.service.getUserPaymentDetail(req.user.sub, orderId);
  }
}
