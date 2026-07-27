import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { CallCenterController } from './controllers/call-center.controller';
import {
  CallCenterCall,
  CallCenterCallSchema,
} from './schemas/call-center.schema';
import { CallCenterService } from './services/call-center.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: CallCenterCall.name, schema: CallCenterCallSchema },
    ]),
  ],
  controllers: [CallCenterController],
  providers: [CallCenterService],
  exports: [CallCenterService],
})
export class CallCenterModule {}
