import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { MentorsController } from './controllers/mentors.controller';
import {
  MentorRecord,
  MentorRecordSchema,
} from './schemas/mentor-record.schema';
import { MentorsService } from './services/mentors.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: MentorRecord.name, schema: MentorRecordSchema },
    ]),
  ],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [MentorsService],
})
export class MentorsModule {}
