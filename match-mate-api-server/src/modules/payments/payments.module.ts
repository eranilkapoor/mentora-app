import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentsService } from './services/payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentAdminController } from './controllers/payment.admin.controller';
import { Plan, PlanSchema } from '../subscriptions/schemas/plan.schema';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Plan.name, schema: PlanSchema },
    ]),
    SubscriptionsModule,
  ],
  providers: [PaymentsService, PaymentRepository],
  controllers: [PaymentsController, PaymentAdminController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
