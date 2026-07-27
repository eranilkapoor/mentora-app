import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsModule } from '../contexts/contexts.module';
import { CommunicationsController } from './controllers/communications.controller';
import {
  Communication,
  CommunicationSchema,
} from './schemas/communications.schema';
import { CommunicationsService } from './services/communications.service';

@Module({
  imports: [
    ContextsModule,
    MongooseModule.forFeature([
      { name: Communication.name, schema: CommunicationSchema },
    ]),
  ],
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
