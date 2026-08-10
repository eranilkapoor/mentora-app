import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import { ContextsModule } from '../contexts/contexts.module';
import { ActivitiesController } from './controllers/activities.controller';
import { Activity, ActivitySchema } from './schemas/activity.schema';
import { ActivitiesService } from './services/activities.service';

@Module({
  imports: [
    ContextsModule,
    RbacModule,
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
