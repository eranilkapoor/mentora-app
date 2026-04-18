import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser {
  user?: {
    sub?: string;
  };
}

@Controller('payments')
// @UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('order')
  createOrder(@Req() req: RequestWithUser, @Body() dto: CreateOrderDto) {
    return this.service.createOrder(req.user?.sub ?? '', dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyPaymentDto) {
    return this.service.verifyPayment(dto);
  }

  @Get('/*path')
  getMyPayments(@Req() req: RequestWithUser) {
    return this.service.getUserPayments(req.user?.sub ?? '');
  }
}
