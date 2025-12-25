import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { PaymentStatus } from './enums/payment-status.enum';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly model: Model<PaymentDocument>,
  ) {}

  create(data: Partial<Payment>) {
    return this.model.create(data);
  }

  findByOrderId(orderId: string) {
    return this.model.findOne({ orderId });
  }

  updateStatus(orderId: string, status: PaymentStatus, paymentId?: string) {
    return this.model.findOneAndUpdate(
      { orderId },
      { status, paymentId },
      { new: true },
    );
  }

  findUserPayments(userId: string) {
    return this.model.find({ userId: new Types.ObjectId(userId) });
  }
}