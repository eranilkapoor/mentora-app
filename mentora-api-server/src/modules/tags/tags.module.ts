import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { TagsController } from './controllers/tags.controller';
import { CrmTag, CrmTagSchema } from './schemas/tags.schema';
import { TagsService } from './services/tags.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([{ name: CrmTag.name, schema: CrmTagSchema }]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
