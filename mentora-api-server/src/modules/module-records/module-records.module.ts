import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleRecordsController } from './controllers/module-records.controller';
import {
  ModuleRecord,
  ModuleRecordSchema,
} from './schemas/module-records.schema';
import { ModuleCoverageService } from './services/module-coverage.service';
import { ModuleRecordsService } from './services/module-records.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModuleRecord.name, schema: ModuleRecordSchema },
    ]),
  ],
  controllers: [ModuleRecordsController],
  providers: [ModuleRecordsService, ModuleCoverageService],
  exports: [ModuleRecordsService],
})
export class ModuleRecordsModule {}
