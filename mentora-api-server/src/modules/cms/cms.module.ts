import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { CmsController } from './controllers/cms.controller';
import { CmsEntry, CmsEntrySchema } from './schemas/cms-entry.schema';
import { CmsService } from './services/cms.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: CmsEntry.name, schema: CmsEntrySchema },
    ]),
  ],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
