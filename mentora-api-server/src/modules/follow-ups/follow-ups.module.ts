import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import { ContextsModule } from '../contexts/contexts.module';
import { FollowUpsController } from './controllers/follow-ups.controller';
import { FollowUp, FollowUpSchema } from './schemas/follow-up.schema';
import { FollowUpsService } from './services/follow-ups.service';

@Module({
  imports: [
    ContextsModule,
    RbacModule,
    MongooseModule.forFeature([
      { name: FollowUp.name, schema: FollowUpSchema },
    ]),
  ],
  controllers: [FollowUpsController],
  providers: [FollowUpsService],
  exports: [FollowUpsService],
})
export class FollowUpsModule {}
