import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [PaymentService, PaymentRepository],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}