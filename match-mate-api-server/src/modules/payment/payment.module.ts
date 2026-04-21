import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentService } from './services/payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentController } from './controllers/payment.controller';
import { PaymentAdminController } from './controllers/payment.admin.controller';
import { Plan, PlanSchema } from '../plan/schemas/plan.schema';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Plan.name, schema: PlanSchema },
    ]),
    SubscriptionModule,
  ],
  providers: [PaymentService, PaymentRepository],
  controllers: [PaymentController, PaymentAdminController],
  exports: [PaymentService],
})
export class PaymentModule {}
