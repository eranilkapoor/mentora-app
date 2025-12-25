import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
// @UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('order')
  createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.service.createOrder(req.user.id, dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyPaymentDto) {
    return this.service.verifyPayment(dto);
  }

  @Get()
  getMyPayments(@Req() req: any) {
    return this.service.getUserPayments(req.user.id);
  }
}