import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { Plan, PlanSchema } from '../plan/schemas/plan.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Plan.name, schema: PlanSchema },
    ]),
    AuthModule,
  ],
  providers: [SubscriptionService],
  controllers: [],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
