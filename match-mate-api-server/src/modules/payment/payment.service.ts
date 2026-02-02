import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { Types } from 'mongoose';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Mock Order ID (replace with Razorpay/Stripe)
    const orderId = `ORD_${Date.now()}`;

    return this.paymentRepo.create({
      userId: new Types.ObjectId(userId),
      orderId,
      amount: dto.amount,
      planId: dto.planId,
      gateway: 'RAZORPAY',
    });
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const payment = await this.paymentRepo.findByOrderId(dto.orderId);
    if (!payment) {
      throw new BadRequestException('Invalid order');
    }

    // TODO: signature verification via gateway SDK

    return this.paymentRepo.updateStatus(
      dto.orderId,
      PaymentStatus.SUCCESS,
      dto.paymentId,
    );
  }

  getUserPayments(userId: string) {
    return this.paymentRepo.findUserPayments(userId);
  }
}
