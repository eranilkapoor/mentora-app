import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentsService } from './services/payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentsController } from './controllers/payments.controller';
import { Plan, PlanSchema } from '../subscriptions/schemas/plan.schema';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ReferralsModule } from '../referrals/referrals.module';
import {
  PromotionCoupon,
  PromotionCouponSchema,
} from './schemas/promotion-coupon.schema';
import {
  PaymentInvoice,
  PaymentInvoiceSchema,
} from './schemas/payment-invoice.schema';
import { PaymentMaintenanceTask } from './tasks/payment-maintenance.task';
import { StoreReceiptVerifierService } from './services/store-receipt-verifier.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: PromotionCoupon.name, schema: PromotionCouponSchema },
      { name: PaymentInvoice.name, schema: PaymentInvoiceSchema },
    ]),
    SubscriptionsModule,
    ReferralsModule,
  ],
  providers: [
    PaymentsService,
    PaymentRepository,
    PaymentMaintenanceTask,
    StoreReceiptVerifierService,
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
