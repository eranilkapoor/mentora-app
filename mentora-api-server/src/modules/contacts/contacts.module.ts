import { Module } from '@nestjs/common';
import { ModuleRecordsModule } from '../module-records/module-records.module';
import { ContactsController } from './controllers/contacts.controller';

@Module({
  imports: [ModuleRecordsModule],
  controllers: [ContactsController],
})
export class ContactsModule {}
