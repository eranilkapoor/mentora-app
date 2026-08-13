import { Module } from '@nestjs/common';
import { ContextsModule } from '../contexts/contexts.module';
import { ModuleRecordsModule } from '../module-records/module-records.module';
import { ContactsController } from './controllers/contacts.controller';

@Module({
  imports: [ContextsModule, ModuleRecordsModule],
  controllers: [ContactsController],
})
export class ContactsModule {}
