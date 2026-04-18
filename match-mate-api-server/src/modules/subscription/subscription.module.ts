import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { Plan, PlanSchema } from '../plan/schemas/plan.schema';
import { UserRepository } from '../auth/repositories/user.repository';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SubscriptionService, UserRepository],
  controllers: [],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
