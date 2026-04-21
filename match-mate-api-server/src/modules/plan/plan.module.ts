import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Plan, PlanSchema } from './schemas/plan.schema';
import { Feature, FeatureSchema } from './schemas/feature.schema';
import { PlanFeature, PlanFeatureSchema } from './schemas/plan-feature.schema';

// Services
import { PlanService } from './services/plan.service';
import { FeatureService } from './services/feature.service';

// Controller
import { PlanController } from './controllers/plan.controller';

// Guards
import { FeatureGuard } from './guards/feature.guard';

// External modules
import { SubscriptionModule } from '../subscription/subscription.module';
import { CacheModule } from '../cache/cache.module';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscription/schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Feature.name, schema: FeatureSchema },
      { name: PlanFeature.name, schema: PlanFeatureSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),

    // 🔥 REQUIRED for feature validation
    SubscriptionModule,

    // 🔥 REQUIRED for usage tracking (redis)
    CacheModule,
  ],

  controllers: [
    PlanController, // admin APIs
  ],

  providers: [PlanService, FeatureService, FeatureGuard],

  exports: [
    PlanService,
    FeatureService,
    FeatureGuard, // 🔥 IMPORTANT (used globally)
  ],
})
export class PlanModule {}
