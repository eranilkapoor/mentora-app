import { Module } from '@nestjs/common';
import { ModuleRecordsModule } from '../module-records/module-records.module';
import { CustomFieldsController } from './controllers/custom-fields.controller';

@Module({
  imports: [ModuleRecordsModule],
  controllers: [CustomFieldsController],
})
export class CustomFieldsModule {}
