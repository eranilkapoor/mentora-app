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
import {
  BillingContract,
  BillingContractSchema,
} from './schemas/billing-contract.schema';
import {
  BillingDunningEvent,
  BillingDunningEventSchema,
} from './schemas/billing-dunning-event.schema';
import {
  PaymentCreditNote,
  PaymentCreditNoteSchema,
} from './schemas/payment-credit-note.schema';
import { PaymentMaintenanceTask } from './tasks/payment-maintenance.task';
import { StoreReceiptVerifierService } from './services/store-receipt-verifier.service';
import { GooglePlayRtdnService } from './services/google-play-rtdn.service';
import { Branch, BranchSchema } from '../organizations/schemas/branch.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';
import {
  Organization,
  OrganizationSchema,
} from '../organizations/schemas/organization.schema';
import {
  UserMembership,
  UserMembershipSchema,
} from '../contexts/schemas/contexts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: PromotionCoupon.name, schema: PromotionCouponSchema },
      { name: PaymentInvoice.name, schema: PaymentInvoiceSchema },
      { name: BillingContract.name, schema: BillingContractSchema },
      { name: BillingDunningEvent.name, schema: BillingDunningEventSchema },
      { name: PaymentCreditNote.name, schema: PaymentCreditNoteSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
    SubscriptionsModule,
    ReferralsModule,
  ],
  providers: [
    PaymentsService,
    PaymentRepository,
    PaymentMaintenanceTask,
    StoreReceiptVerifierService,
    GooglePlayRtdnService,
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
