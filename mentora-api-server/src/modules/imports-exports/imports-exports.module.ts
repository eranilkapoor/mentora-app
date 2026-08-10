import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { ImportsExportsController } from './controllers/imports-exports.controller';
import {
  ImportExportJob,
  ImportExportJobSchema,
} from './schemas/imports-exports.schema';
import { ImportsExportsService } from './services/imports-exports.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: ImportExportJob.name, schema: ImportExportJobSchema },
    ]),
  ],
  controllers: [ImportsExportsController],
  providers: [ImportsExportsService],
  exports: [ImportsExportsService],
})
export class ImportsExportsModule {}
