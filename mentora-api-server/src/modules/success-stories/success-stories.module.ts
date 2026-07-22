import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSuccessStoryController } from './controllers/admin-success-story.controller';
import { SuccessStoryController } from './controllers/success-story.controller';
import {
  SuccessStory,
  SuccessStorySchema,
} from './schemas/success-story.schema';
import { SuccessStoryService } from './services/success-story.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SuccessStory.name, schema: SuccessStorySchema },
    ]),
    AdminModule,
  ],
  controllers: [SuccessStoryController, AdminSuccessStoryController],
  providers: [SuccessStoryService],
  exports: [SuccessStoryService],
})
export class SuccessStoriesModule {}
