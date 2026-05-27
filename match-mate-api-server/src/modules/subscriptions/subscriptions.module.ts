import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { Plan, PlanSchema } from './schemas/plan.schema';
import { Feature, FeatureSchema } from './schemas/feature.schema';
import { PlanFeature, PlanFeatureSchema } from './schemas/plan-feature.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';

// Services
import { SubscriptionsService } from './services/subscriptions.service';
import { PlanService } from './services/plan.service';
import { FeatureService } from './services/feature.service';

// Controller
import { PlanController } from './controllers/plan.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';

// Guards
import { FeatureGuard } from './guards/feature.guard';

// External modules
import { CacheModule } from '../cache/cache.module';
import { AuthModule } from '../auth/auth.module';

// Tasks
import { SubscriptionExpiryTask } from './tasks/subscription-expiry.task';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Feature.name, schema: FeatureSchema },
      { name: PlanFeature.name, schema: PlanFeatureSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    AuthModule,
    //  REQUIRED for usage tracking (redis)
    CacheModule,
  ],
  providers: [
    SubscriptionsService,
    PlanService,
    FeatureService,
    FeatureGuard,
    SubscriptionExpiryTask,
  ],
  controllers: [PlanController, SubscriptionsController],
  exports: [
    SubscriptionsService,
    PlanService,
    FeatureService,
    FeatureGuard, //  IMPORTANT (used globally)
  ],
})
export class SubscriptionsModule {}
