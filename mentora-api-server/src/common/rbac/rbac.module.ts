import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import {
  UserMembership,
  UserMembershipSchema,
} from '@/modules/contexts/schemas/contexts.schema';
import { ActorScopeService } from './actor-scope.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
  providers: [ActorScopeService],
  exports: [ActorScopeService],
})
export class RbacModule {}
