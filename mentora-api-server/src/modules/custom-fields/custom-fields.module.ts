import { Module } from '@nestjs/common';
import { ContextsModule } from '../contexts/contexts.module';
import { ModuleRecordsModule } from '../module-records/module-records.module';
import { CustomFieldsController } from './controllers/custom-fields.controller';

@Module({
  imports: [ContextsModule, ModuleRecordsModule],
  controllers: [CustomFieldsController],
})
export class CustomFieldsModule {}
